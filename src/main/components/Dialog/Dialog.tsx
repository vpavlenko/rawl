import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import {
  Content,
  DialogProps,
  Overlay,
  Portal,
  Root,
} from "@radix-ui/react-dialog"
import { FC } from "react"

const overlayShow = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const contentShow = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`

const StyledOverlay = styled(Overlay)`
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  inset: 0;
  animation: ${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
`

const StyledContent = styled(Content)`
  z-index: 3;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 6px;
  box-shadow: 0 0.5rem 3rem ${({ theme }) => theme.shadowColor};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-bottom: 1rem;
  max-width: 25rem;
  max-height: 85vh;
  padding: 1rem;
  animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }
`

export const Dialog: FC<DialogProps> = ({ children, ...props }) => (
  <Root {...props}>
    <Portal>
      <StyledOverlay />
      <StyledContent>{children}</StyledContent>
    </Portal>
  </Root>
)

export const DialogTitle = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 1rem;
`

export const DialogContent = styled.div``

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;

  & > *:not(:last-child) {
    margin-right: 1rem;
  }
`
