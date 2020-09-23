import React, { FC } from "react"
import NavigationBar from "main/components/groups/NavigationBar"
import ArrangeToolbar from "./ArrangeToolbar"
import RootStore from "stores/RootStore"
import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import ArrangeView from "./ArrangeView"

import "./ArrangeEditor.css"

interface ArrangeEditorProps {
  pushSettings: () => void
}

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

const ArrangeEditor: FC<ArrangeEditorProps> = ({ pushSettings }) => {
  return (
    <div className="ArrangeEditor">
      <NavigationBar>
        <ArrangeToolbar />
        <div className="menu">
          <NavItem title="settings" onClick={pushSettings} />
        </div>
      </NavigationBar>
      <ArrangeView />
    </div>
  )
}

const mapStoreToProps = ({ rootStore: { router } }: { rootStore: RootStore }) =>
  ({
    pushSettings: () => router.pushSettings(),
  } as ArrangeEditorProps)

export default compose(inject(mapStoreToProps), observer)(ArrangeEditor)
