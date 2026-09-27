import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Results subscribe only to settled queries, never to individual keystrokes.
export const SearchResultsContext = React.createContext("");

export const SearchContext = React.createContext({
  query: "",
  expanded: false,
  setQuery: (_query: string) => {},
  setExpanded: (_expanded: boolean) => {},
  close: () => {},
});

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState("");
  const [resultsQuery, setResultsQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const close = React.useCallback(() => {
    setQuery("");
    setResultsQuery("");
    setExpanded(false);
  }, []);

  useEffect(close, [location, close]);
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResultsQuery("");
      return;
    }
    const timer = window.setTimeout(() => setResultsQuery(trimmed), 200);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      close();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [expanded, close]);

  return (
    <SearchContext.Provider
      value={React.useMemo(
        () => ({ query, expanded, setQuery, setExpanded, close }),
        [query, expanded, close],
      )}
    >
      <SearchResultsContext.Provider value={resultsQuery}>
        {children}
      </SearchResultsContext.Provider>
    </SearchContext.Provider>
  );
};
