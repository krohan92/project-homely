import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Shell } from "@/components/Shell";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/Calendar";
import Chores from "@/pages/Chores";
import Kids from "@/pages/Kids";
import Pets from "@/pages/Pets";
import Groceries from "@/pages/Groceries";
import Budget from "@/pages/Budget";
import Upkeep from "@/pages/Upkeep";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chores" element={<Chores />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/groceries" element={<Groceries />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/home" element={<Upkeep />} />
          </Routes>
        </Shell>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
