import React, { createContext, useContext } from "react"
import RootStore from "../stores/RootStore"

export const StoreContext = createContext<{ rootStore: RootStore }>({
  rootStore: (null as unknown) as RootStore, // never use default value
})
export const useStores = () => useContext(StoreContext)
