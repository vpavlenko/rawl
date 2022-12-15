import styled from "@emotion/styled"
import { FC, PropsWithChildren, ReactNode } from "react"

export interface SelectBoxProps<T> {
  items: { label: ReactNode; value: T }[]
  selectedValue: T
  onChange: (value: T) => void
}

const Select = styled.div`
  overflow: auto;
  background-color: #00000024;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  max-height: 22rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  &:focus {
    outline: ${({ theme }) => theme.themeColor} 1px solid;
  }
`

const _Option = styled.div`
  padding: 0.5em 1em;
  flex-shrink: 0;
  font-size: 0.9rem;
  height: 2rem;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: none;

  &.checked {
    background: ${({ theme }) => theme.themeColor};
  }
`

const Option: FC<
  PropsWithChildren<{ checked: boolean; onClick: () => void }>
> = ({ checked, onClick, children }) => {
  return (
    <_Option className={checked ? "checked" : ""} onClick={onClick}>
      {children}
    </_Option>
  )
}

export const SelectBox = <T extends {}>({
  items,
  selectedValue,
  onChange,
}: SelectBoxProps<T>) => {
  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    const currentIndex = items.findIndex((item) => item.value === selectedValue)

    switch (e.key) {
      case "ArrowUp":
        if (currentIndex > 0) {
          onChange(items[currentIndex - 1].value)
        }
        e.preventDefault()
        e.stopPropagation()
        break
      case "ArrowDown":
        if (currentIndex < items.length - 1) {
          onChange(items[currentIndex + 1].value)
        }
        e.preventDefault()
        e.stopPropagation()
        break
    }
  }

  return (
    <Select onKeyDown={onKeyDown} tabIndex={0}>
      {items.map((item, i) => (
        <Option
          key={i}
          checked={item.value === selectedValue}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Option>
      ))}
    </Select>
  )
}
