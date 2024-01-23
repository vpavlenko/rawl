import * as React from "react";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type ColorScheme = "colors" | "shapes";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
}

const defaultContextValue: ColorSchemeContextType = {
  colorScheme: "colors",
  setColorScheme: () => {},
};

const ColorSchemeContext =
  createContext<ColorSchemeContextType>(defaultContextValue);

export const ColorSchemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("colors");

  useEffect(() => {
    const savedScheme = localStorage.getItem("colorScheme");
    if (savedScheme) {
      setColorScheme(savedScheme as ColorScheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("colorScheme", colorScheme);
  }, [colorScheme]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = (): ColorSchemeContextType => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
};
