import { createContext } from "react";

export const StrumVoicesContext = createContext<ReadonlySet<number>>(new Set());
