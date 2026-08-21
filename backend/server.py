from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Homely API")
special = APIRouter(prefix="/api")
api = APIRouter(prefix="/api")

BASE_IMG = "https://static.prod-images.emergentagent.com/jobs/2126ddcf-02c3-4ae4-9679-4a095e3c697d/images"
AVATARS = {
    "Alex": f"{BASE_IMG}/7a47d1c2c5b22a2c38be1ac74ed979b2d292a868e6fa552c79111167230a25e4.jpeg",
    "Sam": f"{BASE_IMG}/64d8794b61e8abd04e413e807ad42a74fe2fe98eb11ce41e65e29b5f1d71210c.jpeg",
    "Mia": f"{BASE_IMG}/82ec2b3a234fbff6e2025de9d8607fd0a49170d796faf3a468372391397eb568.jpeg",
    "Leo": f"{BASE_IMG}/fd31c01025d9583495f2febf4cd45e5d0520c91872338665acdfce61749dc13d.jpeg",
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("homely")

RESOURCES = [
    "members", "events", "chores", "homework", "pets",
    "petlogs", "groceries", "transactions", "todos", "maintenance",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def list_docs(res: str) -> List[Dict[str, Any]]:
    return await db[res].find({}, {"_id": 0}).sort("created_at", 1).to_list(1000)


@api.get("/")
async def root():
    return {"app": "homely", "ok": True}


@api.get("/{res}")
async def get_all(res: str):
    if res not in RESOURCES:
        raise HTTPException(404, "Unknown resource")
    return await list_docs(res)


@api.post("/{res}")
async def create(res: str, payload: Dict[str, Any]):
    if res not in RESOURCES:
        raise HTTPException(404, "Unknown resource")
    doc = {**payload, "id": str(uuid.uuid4()), "created_at": now_iso()}
    await db[res].insert_one(dict(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


@api.patch("/{res}/{item_id}")
async def update(res: str, item_id: str, payload: Dict[str, Any]):
    if res not in RESOURCES:
        raise HTTPException(404, "Unknown resource")
    payload.pop("id", None)
    r = await db[res].update_one({"id": item_id}, {"$set": payload})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db[res].find_one({"id": item_id}, {"_id": 0})


@api.delete("/{res}/{item_id}")
async def remove(res: str, item_id: str):
    if res not in RESOURCES:
        raise HTTPException(404, "Unknown resource")
    await db[res].delete_one({"id": item_id})
    return {"deleted": item_id}


@special.get("/insights/catchup")
async def catchup():
    data = {r: await list_docs(r) for r in RESOURCES}
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"homely-catchup-{today}",
            system_message=(
                "You are Homely, a warm, upbeat household assistant for a family. "
                "Given household JSON data, write a short catch-up: 2 sentences of greeting/summary, "
                "then exactly 3 bullet lines starting with '- ' covering what needs attention today "
                "(appointments, overdue chores, homework due, pet care, groceries, budget). "
                "Be specific with names and dates. No markdown headings, no emoji."
            ),
        ).with_model("anthropic", "claude-sonnet-4-6")
        msg = UserMessage(text=f"Today is {today}. Household data:\n{data}")
        out = ""
        async for ev in chat.stream_message(msg):
            if isinstance(ev, TextDelta):
                out += ev.content
            elif isinstance(ev, StreamDone):
                break
        return {"summary": out.strip(), "generated_at": now_iso(), "ai": True}
    except Exception as e:
        logger.error(f"catchup failed: {e}")
        chores_due = [c for c in data["chores"] if not c.get("done")]
        groceries = [g for g in data["groceries"] if not g.get("done")]
        hw = [h for h in data["homework"] if not h.get("done")]
        return {
            "summary": (
                "Here's your household at a glance.\n"
                f"- {len(chores_due)} chores still open this week\n"
                f"- {len(hw)} homework items pending\n"
                f"- {len(groceries)} items on the grocery list"
            ),
            "generated_at": now_iso(),
            "ai": False,
        }


@special.post("/seed")
async def seed(force: bool = False):
    if not force and await db.members.count_documents({}) > 0:
        return {"seeded": False}
    for r in RESOURCES:
        await db[r].delete_many({})

    d = lambda n: (datetime.now(timezone.utc).date() + timedelta(days=n)).isoformat()

    members = [
        {"name": "Alex", "role": "partner", "color": "#E07A5F", "avatar": AVATARS["Alex"]},
        {"name": "Sam", "role": "partner", "color": "#81B29A", "avatar": AVATARS["Sam"]},
        {"name": "Mia", "role": "kid", "grade": "3rd Grade", "color": "#F2CC8F", "avatar": AVATARS["Mia"]},
        {"name": "Leo", "role": "kid", "grade": "1st Grade", "color": "#9A8C98", "avatar": AVATARS["Leo"]},
    ]
    events = [
        {"title": "Mia - Dentist checkup", "date": d(1), "time": "10:30", "category": "kids", "who": "Mia"},
        {"title": "Buddy - Vet vaccine booster", "date": d(2), "time": "16:00", "category": "pet", "who": "Buddy"},
        {"title": "Leo - Swim class", "date": d(0), "time": "17:30", "category": "kids", "who": "Leo"},
        {"title": "Parent-teacher meeting", "date": d(5), "time": "18:00", "category": "school", "who": "Alex"},
        {"title": "Boiler service", "date": d(9), "time": "09:00", "category": "home", "who": "Sam"},
    ]
    chores = [
        {"title": "Dishes", "assignee": "Alex", "day": d(0), "repeat": "daily", "done": False, "points": 2},
        {"title": "Laundry", "assignee": "Sam", "day": d(0), "repeat": "weekly", "done": True, "points": 3},
        {"title": "Mop kitchen floor", "assignee": "Alex", "day": d(1), "repeat": "weekly", "done": False, "points": 4},
        {"title": "Take out trash", "assignee": "Sam", "day": d(0), "repeat": "daily", "done": False, "points": 1},
        {"title": "Bathroom deep clean", "assignee": "Sam", "day": d(3), "repeat": "weekly", "done": False, "points": 5},
        {"title": "Vacuum living room", "assignee": "Alex", "day": d(2), "repeat": "weekly", "done": False, "points": 3},
    ]
    homework = [
        {"child": "Mia", "subject": "Math", "title": "Worksheet p.42 - fractions", "due": d(1), "done": False},
        {"child": "Mia", "subject": "Reading", "title": "Read 20 pages of Matilda", "due": d(0), "done": True},
        {"child": "Leo", "subject": "Spelling", "title": "Practice 10 spelling words", "due": d(2), "done": False},
        {"child": "Leo", "subject": "Art", "title": "Bring leaf collage materials", "due": d(4), "done": False},
    ]
    pets = [{"name": "Buddy", "species": "Dog", "breed": "Golden Retriever", "age": "4 yrs",
             "next_vaccine": d(2), "vaccine_name": "Rabies booster", "vet": "Green Paws Clinic"}]
    petlogs = [
        {"pet": "Buddy", "type": "walk", "note": "Morning walk, 25 min", "at": now_iso(), "by": "Alex"},
        {"pet": "Buddy", "type": "poop", "note": "All good", "at": now_iso(), "by": "Alex"},
        {"pet": "Buddy", "type": "food", "note": "Breakfast", "at": now_iso(), "by": "Sam"},
    ]
    groceries = [
        {"name": "Oat milk", "qty": "2", "aisle": "Dairy", "done": False},
        {"name": "Bananas", "qty": "1 bunch", "aisle": "Produce", "done": False},
        {"name": "Dog food", "qty": "5kg", "aisle": "Pets", "done": False},
        {"name": "Pasta", "qty": "3", "aisle": "Pantry", "done": True},
        {"name": "Dish soap", "qty": "1", "aisle": "Household", "done": False},
    ]
    transactions = [
        {"label": "Weekly groceries", "amount": 128.40, "category": "Groceries", "type": "expense", "date": d(-2)},
        {"label": "Electricity bill", "amount": 86.00, "category": "Utilities", "type": "expense", "date": d(-4)},
        {"label": "Vet visit deposit", "amount": 45.00, "category": "Pets", "type": "expense", "date": d(-1)},
        {"label": "Kids swim class", "amount": 60.00, "category": "Kids", "type": "expense", "date": d(-6)},
        {"label": "Salary", "amount": 3200.00, "category": "Income", "type": "income", "date": d(-10)},
        {"label": "Takeout Friday", "amount": 42.50, "category": "Dining", "type": "expense", "date": d(-3)},
    ]
    todos = [
        {"title": "Book summer camp for Mia", "done": False, "priority": "high", "owner": "Sam"},
        {"title": "Renew car insurance", "done": False, "priority": "medium", "owner": "Alex"},
        {"title": "Fix leaky tap in bathroom", "done": False, "priority": "low", "owner": "Alex"},
    ]
    maintenance = [
        {"title": "Change HVAC filter", "due": d(12), "interval": "3 months", "done": False},
        {"title": "Test smoke alarms", "due": d(20), "interval": "6 months", "done": False},
    ]

    payloads = {"members": members, "events": events, "chores": chores, "homework": homework,
                "pets": pets, "petlogs": petlogs, "groceries": groceries,
                "transactions": transactions, "todos": todos, "maintenance": maintenance}
    for res, items in payloads.items():
        docs = [{**i, "id": str(uuid.uuid4()), "created_at": now_iso()} for i in items]
        await db[res].insert_many(docs)
    return {"seeded": True}


app.include_router(special)
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    if await db.members.count_documents({}) == 0:
        await seed()
    for name, url in AVATARS.items():
        await db.members.update_one({"name": name}, {"$set": {"avatar": url}})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
