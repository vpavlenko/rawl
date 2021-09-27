import { IconButton } from "@material-ui/core"
import { ArrowDropDown, ArrowLeft } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"

const NavBackButton = styled(IconButton)`
  svg {
    transform: scale(1.5);
  }

  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
`

export const TrackListMenuButton: FC = observer(() => {
  const { rootViewStore } = useStores()
  const open = rootViewStore.openTrackListDrawer
  const onClickNavBack = useCallback(
    () =>
      (rootViewStore.openTrackListDrawer = !rootViewStore.openTrackListDrawer),
    [rootViewStore]
  )

  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <NavBackButton ref={ref} onClick={onClickNavBack}>
        {open ? <ArrowLeft /> : <ArrowDropDown />}
      </NavBackButton>
    </>
  )
})
