"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en from "./en.json";
import ko from "./ko.json";

export type Locale = "en" | "ko";

const dictionaries: Record<Locale, Record<string, string>> = { en, ko };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ko")) {
      setLocaleState(saved);
    } else if (typeof navigator !== "undefined" && navigator.language.startsWith("ko")) {
      setLocaleState("ko");
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let str = dictionaries[locale][key] || dictionaries.en[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
