import styled from "@emotion/styled"
import { ArrowDropDown, ArrowLeft } from "@mui/icons-material"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import { useStores } from "../../hooks/useStores"

const NavBackButton = styled.button`
  -webkit-appearance: none;
  border: none;
  outline: none;
  height: 2rem;
  background: none;
  color: inherit;
  cursor: pointer;

  svg {
    transform: scale(1.5);
  }

  &:hover {
    background: none;
    color: ${({ theme }) => theme.secondaryTextColor};
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
