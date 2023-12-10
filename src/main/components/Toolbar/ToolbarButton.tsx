import styled from "@emotion/styled"
import { ComponentProps, forwardRef } from "react"

const _ToolbarButton = styled.button<{ selected?: boolean }>`
  -webkit-appearance: none;
  min-width: auto;
  padding: 0 0.8rem;
  color: inherit;
  border: none;
  background: ${({ theme, selected }) =>
    selected ? theme.themeColor : theme.darkBackgroundColor};
  text-transform: none;
  height: 2rem;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  border-radius: 999px;
  cursor: pointer;
  outline: none;

  &:hover {
    background: ${({ theme, selected }) =>
      selected ? theme.themeColor : theme.highlightColor};
  }
`

export const ToolbarButton = forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<
    Omit<ComponentProps<typeof _ToolbarButton>, "tabIndex">
  >
>(({ children, onMouseDown, ...props }, ref) => (
  <_ToolbarButton
    {...props}
    onMouseDown={(e) => {
      e.preventDefault()
      onMouseDown?.(e)
    }}
    tabIndex={-1}
    ref={ref}
  >
    {children}
  </_ToolbarButton>
))
