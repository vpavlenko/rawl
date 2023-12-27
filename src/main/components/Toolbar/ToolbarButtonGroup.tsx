import styled from "@emotion/styled"
import { ComponentProps, forwardRef } from "react"

export const ToolbarButtonGroup = styled.div`
  min-width: auto;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const _ToolbarButtonGroupItem = styled.button<{ selected?: boolean }>`
  outline: none;
  -webkit-appearance: none;
  min-width: auto;
  padding: 0 0.5rem;
  color: inherit;
  background: ${({ theme, selected }) =>
    selected ? theme.themeColor : theme.secondaryBackgroundColor};
  text-transform: none;
  height: 2rem;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;

  border: none;
  border-radius: 4px;

  &:first-of-type {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover {
    background: ${({ theme, selected }) =>
      selected ? theme.themeColor : theme.highlightColor};
  }
`

export const ToolbarButtonGroupItem = forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<
    Omit<ComponentProps<typeof _ToolbarButtonGroupItem>, "tabIndex">
  >
>(({ children, onMouseDown, ...props }, ref) => (
  <_ToolbarButtonGroupItem
    {...props}
    onMouseDown={(e) => {
      e.preventDefault()
      onMouseDown?.(e)
    }}
    tabIndex={-1}
    ref={ref}
  >
    {children}
  </_ToolbarButtonGroupItem>
))
