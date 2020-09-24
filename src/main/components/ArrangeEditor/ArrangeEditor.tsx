import React, { FC } from "react"
import NavigationBar from "main/components/groups/NavigationBar"
import { ArrangeToolbar } from "../ArrangeView/ArrangeToolbar"
import ArrangeView from "./ArrangeView"
import { useStores } from "../../hooks/useStores"

import "./ArrangeEditor.css"

interface NavItemProps {
  title: string
  onClick: () => void
}

function NavItem({ title, onClick }: NavItemProps) {
  return (
    <div className="NavItem" onClick={onClick}>
      {title}
    </div>
  )
}

export const ArrangeEditor: FC = () => {
  const stores = useStores()

  return (
    <div className="ArrangeEditor">
      <NavigationBar>
        <ArrangeToolbar />
        <div className="menu">
          <NavItem
            title="settings"
            onClick={() => stores.rootStore.router.pushSettings()}
          />
        </div>
      </NavigationBar>
      <ArrangeView />
    </div>
  )
}
