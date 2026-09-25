import { createContext } from "react";

export const StrumNotesContext = createContext<ReadonlySet<string>>(new Set());
