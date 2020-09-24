import React from "react"
import { MobXProviderContext } from "mobx-react"
import RootStore from "../stores/RootStore"

// https://mobx-react.js.org/recipes-migration
export const useStores = () =>
  React.useContext(MobXProviderContext) as { rootStore: RootStore }
