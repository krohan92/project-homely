import { useEffect, useState } from "react";
import { Sun, Moon, Leaf } from "lucide-react";

const THEMES = [
  { id: "dawn", label: "Dawn", icon: Sun },
  { id: "dusk", label: "Dusk", icon: Moon },
  { id: "meadow", label: "Meadow", icon: Leaf },
];

export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("homely-theme") || "dawn");
  useEffect(() => {
    document.documentElement.classList.remove("theme-dawn", "theme-dusk", "theme-meadow");
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem("homely-theme", theme);
  }, [theme]);
  return { theme, setTheme };
};

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1" data-testid="theme-toggle">
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          data-testid={`theme-${id}-btn`}
          title={label}
          onClick={() => setTheme(id)}
          className={`flex-1 rounded-full px-3 py-2 text-xs font-bold transition-colors duration-200 ${
            theme === id ? "bg-card text-primary shadow-[0_2px_8px_rgb(0,0,0,0.06)]" : "text-foreground/50 hover:text-foreground"
          }`}
        >
          <Icon className="mx-auto h-4 w-4" strokeWidth={2.4} />
        </button>
      ))}
    </div>
  );
};
