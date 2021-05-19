import { IconButton, Menu } from "@material-ui/core"
import { ArrowDropDown } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"
import { TrackList } from "./TrackList/TrackList"

const NavBackButton = styled(IconButton)`
  svg {
    transform: scale(1.5);
  }

  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
`

export const TrackListDrawer: FC = observer(() => {
  const { rootViewStore } = useStores()
  const open = rootViewStore.openTrackListDrawer
  const close = () => (rootViewStore.openTrackListDrawer = false)
  const onClickNavBack = useCallback(
    () => (rootViewStore.openTrackListDrawer = true),
    [rootViewStore]
  )

  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <NavBackButton ref={ref} onClick={onClickNavBack}>
        <ArrowDropDown />
      </NavBackButton>

      <Menu
        keepMounted
        open={open}
        onClose={close}
        anchorEl={ref.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        getContentAnchorEl={null}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration={50}
        disableAutoFocusItem={true}
      >
        <TrackList />
      </Menu>
    </>
  )
})
