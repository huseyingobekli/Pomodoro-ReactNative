import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "auto";
type ActiveTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  activeTheme: ActiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("auto");

  useEffect(() => {
    // AsyncStorage'dan tema ayarını yükle
    AsyncStorage.getItem("theme").then((savedTheme: string | null) => {
      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "auto"
      ) {
        setThemeState(savedTheme);
      }
    });
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const activeTheme: ActiveTheme =
    theme === "auto" ? systemColorScheme || "light" : theme;

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
