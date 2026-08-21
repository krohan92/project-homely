import os
import time

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"

RESOURCES = [
    "members", "events", "chores", "homework", "pets",
    "petlogs", "groceries", "transactions", "todos", "maintenance",
]

SAMPLE = {
    "members": {"name": "TEST_Member", "role": "kid"},
    "events": {"title": "TEST_Event", "date": "2026-07-10", "time": "10:00", "category": "kids"},
    "chores": {"title": "TEST_Chore", "assignee": "Alex", "done": False, "points": 2},
    "homework": {"child": "Mia", "subject": "Math", "title": "TEST_HW", "done": False},
    "pets": {"name": "TEST_Pet", "species": "Dog"},
    "petlogs": {"pet": "Buddy", "type": "walk", "note": "TEST_log"},
    "groceries": {"name": "TEST_Item", "qty": "2", "aisle": "Dairy", "done": False},
    "transactions": {"label": "TEST_Tx", "amount": 10.5, "type": "expense", "category": "Misc"},
    "todos": {"title": "TEST_Todo", "done": False},
    "maintenance": {"title": "TEST_Maint", "due": "2026-08-01", "done": False},
}


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health ---
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True


# --- Generic CRUD for each resource ---
class TestCRUD:
    @pytest.mark.parametrize("res", RESOURCES)
    def test_list(self, api_client, res):
        r = api_client.get(f"{API}/{res}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        for item in data:
            assert "_id" not in item
            assert "id" in item

    @pytest.mark.parametrize("res", RESOURCES)
    def test_full_crud_cycle(self, api_client, res):
        payload = SAMPLE[res]
        cr = api_client.post(f"{API}/{res}", json=payload)
        assert cr.status_code == 200, cr.text
        created = cr.json()
        assert "_id" not in created
        assert "id" in created and isinstance(created["id"], str)
        assert "created_at" in created
        for k, v in payload.items():
            assert created[k] == v
        item_id = created["id"]

        # GET verify persistence
        lst = api_client.get(f"{API}/{res}").json()
        found = [i for i in lst if i["id"] == item_id]
        assert len(found) == 1, f"created {res} not persisted"

        # PATCH
        first_key = list(payload.keys())[0]
        upd = {first_key: "TEST_updated"} if isinstance(payload[first_key], str) else {"done": True}
        pr = api_client.patch(f"{API}/{res}/{item_id}", json=upd)
        assert pr.status_code == 200, pr.text
        body = pr.json()
        assert "_id" not in body
        for k, v in upd.items():
            assert body[k] == v

        lst = api_client.get(f"{API}/{res}").json()
        found = [i for i in lst if i["id"] == item_id][0]
        for k, v in upd.items():
            assert found[k] == v

        # DELETE
        dr = api_client.delete(f"{API}/{res}/{item_id}")
        assert dr.status_code == 200, dr.text
        assert dr.json().get("deleted") == item_id
        lst = api_client.get(f"{API}/{res}").json()
        assert not [i for i in lst if i["id"] == item_id]

    def test_unknown_resource_get(self, api_client):
        r = api_client.get(f"{API}/nonsense")
        assert r.status_code == 404, r.text

    def test_unknown_resource_post(self, api_client):
        r = api_client.post(f"{API}/nonsense", json={"a": 1})
        assert r.status_code == 404, r.text

    def test_patch_missing_id_returns_404(self, api_client):
        r = api_client.patch(f"{API}/todos/does-not-exist", json={"done": True})
        assert r.status_code == 404, r.text

    def test_delete_missing_id(self, api_client):
        r = api_client.delete(f"{API}/todos/does-not-exist")
        # currently returns 200 regardless; document behaviour
        assert r.status_code in (200, 404), r.text

    def test_patch_cannot_overwrite_id(self, api_client):
        cr = api_client.post(f"{API}/todos", json={"title": "TEST_idguard", "done": False})
        tid = cr.json()["id"]
        api_client.patch(f"{API}/todos/{tid}", json={"id": "hacked", "done": True})
        lst = api_client.get(f"{API}/todos").json()
        assert [i for i in lst if i["id"] == tid]
        api_client.delete(f"{API}/todos/{tid}")


# --- AI catch-up insight ---
class TestCatchup:
    def test_catchup(self, api_client):
        t0 = time.time()
        r = api_client.get(f"{API}/insights/catchup", timeout=120)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("summary"), str) and len(d["summary"]) > 20
        assert "generated_at" in d
        bullets = [ln for ln in d["summary"].splitlines() if ln.strip().startswith("- ")]
        print(f"catchup ai={d.get('ai')} elapsed={elapsed:.1f}s bullets={len(bullets)}")
        assert d.get("ai") is True, f"AI fallback used (LLM failed): {d['summary'][:200]}"
        assert len(bullets) == 3, f"expected 3 bullets, got {len(bullets)}"


# --- Seed endpoint ---
class TestSeed:
    def test_seed_force(self, api_client):
        r = api_client.post(f"{API}/seed?force=true", timeout=60)
        assert r.status_code == 200, f"seed failed: {r.status_code} {r.text}"
        assert r.json().get("seeded") is True
        members = api_client.get(f"{API}/members").json()
        assert len(members) == 4
        assert {m["name"] for m in members} == {"Alex", "Sam", "Mia", "Leo"}

    def test_seed_no_force_is_noop(self, api_client):
        r = api_client.post(f"{API}/seed", timeout=60)
        assert r.status_code == 200, f"seed failed: {r.status_code} {r.text}"
        assert r.json().get("seeded") is False
