import styled from "@emotion/styled"
import * as Portal from "@radix-ui/react-portal"
import { FC, ReactNode, useEffect } from "react"
import { IPoint } from "../common/geometry"

export const ContextMenuHotKey = styled.div`
  font-size: 0.9em;
  flex-grow: 1;
  text-align: right;
  color: ${({ theme }) => theme.secondaryTextColor};
  margin-left: 2em;
`

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`

const Content = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
  border-radius: 0.5rem;
  box-shadow: 0 1rem 3rem ${({ theme }) => theme.shadowColor};
  border: 1px solid ${({ theme }) => theme.backgroundColor};
  padding: 0.5rem 0;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export interface ContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
  children?: ReactNode
}

const estimatedWidth = 200

export const ContextMenu: FC<ContextMenuProps> = ({
  isOpen,
  handleClose,
  position,
  children,
}) => {
  // Menu cannot handle keydown while disabling focus, so we deal with global keydown event
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  if (!isOpen) {
    return <></>
  }

  // fix position to avoid placing menu outside of the screen
  const fixedX = Math.min(position.x, window.innerWidth - estimatedWidth)

  return (
    <Portal.Root>
      <Wrapper onClick={handleClose}>
        <Content
          style={{ left: fixedX, top: position.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <List>{children}</List>
        </Content>
      </Wrapper>
    </Portal.Root>
  )
}
