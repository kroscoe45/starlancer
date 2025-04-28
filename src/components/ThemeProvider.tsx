import { useEffect, useState } from "react";
import { ThemeProviderContext } from "@/hooks/use-theme";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "dark", // Changed default to dark
  storageKey = "starlancer-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  // Add this to set dark mode initially before any hydration or React code runs
  useEffect(() => {
    // Script to prevent flash of light mode
    const script = document.createElement("script");
    script.innerHTML = `
      (function() {
        const storageKey = "${storageKey}";
        const savedTheme = localStorage.getItem(storageKey);
        // If theme not set in localStorage, default to dark
        const initialTheme = savedTheme || "dark";
        
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(
          initialTheme === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
            initialTheme
        );
      })();
    `;
    script.setAttribute("id", "theme-initializer");

    // Check if script already exists to prevent duplication
    if (!document.getElementById("theme-initializer")) {
      document.head.insertBefore(script, document.head.firstChild);
    }

    return () => {
      const initializer = document.getElementById("theme-initializer");
      if (initializer) initializer.remove();
    };
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove the old theme class
    root.classList.remove("light", "dark");

    // Add the new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
