import React, { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export const THEMES = [
  { key: "dark", label: "Sombre", icon: "🌙" },
  { key: "light", label: "Clair", icon: "☀️" },
  { key: "system", label: "Système", icon: "💻" },
];

const resolve = (pref) => {
  if (pref === "system")
    return window.matchMedia("(prefers-color-scheme:dark)").matches
      ? "dark"
      : "light";
  return pref;
};

export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(
    () => localStorage.getItem("themePref") || "dark",
  );
  const [theme, setTheme] = useState(() =>
    resolve(localStorage.getItem("themePref") || "dark"),
  );

  const setPref = (p) => {
    localStorage.setItem("themePref", p);
    setPrefState(p);
    const resolved = resolve(p);
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolve(pref));
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = () => {
      const r = mq.matches ? "dark" : "light";
      setTheme(r);
      document.documentElement.setAttribute("data-theme", r);
    };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [pref]);

  return (
    <Ctx.Provider value={{ theme, pref, setPref, THEMES }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
