import styled from "@emotion/styled"
import { ArrowLeft } from "@mui/icons-material"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { useStores } from "../../hooks/useStores"

const NavBackButton = styled.button`
  -webkit-appearance: none;
  border: none;
  outline: none;
  height: 2rem;
  background: none;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: none;
    color: ${({ theme }) => theme.secondaryTextColor};
  }
`

interface ArrowIconProps {
  isOpen: boolean
}

const ArrowIcon: FC<ArrowIconProps> = ({ isOpen }) => (
  <ArrowLeft
    style={{
      transition: "transform 0.1s ease",
      transform: `scale(1.5) rotateZ(${isOpen ? "0deg" : "-90deg"})`,
    }}
  />
)

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
      <NavBackButton
        ref={ref}
        onClick={onClickNavBack}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ArrowIcon isOpen={open} />
      </NavBackButton>
    </>
  )
})
