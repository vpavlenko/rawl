import styled from "@emotion/styled"
import KeyboardArrowDown from "mdi-react/KeyboardArrowDownIcon"
import KeyboardArrowUp from "mdi-react/KeyboardArrowUpIcon"
import { FC } from "react"

export interface NumberPickerProps {
  value: number
  prevValue: () => number
  nextValue: () => number
  className?: string
  onChange: (v: number) => void
}

const Value = styled.div`
  font-size: 150%;
  background: ${({ theme }) => theme.backgroundColor};
  border: 1px solid ${({ theme }) => theme.dividerColor};
  width: 2em;
  padding: 0.25em;
  text-align: center;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    color: ${({ theme }) => theme.secondaryTextColor};
  }

  svg:hover {
    color: ${({ theme }) => theme.textColor};
  }
`

export const NumberPicker: FC<NumberPickerProps> = ({
  value,
  prevValue,
  nextValue,
  className,
  onChange,
}) => {
  function handleWheel(e: React.WheelEvent) {
    onChange(e.deltaY < 0 ? prevValue() : nextValue())
  }

  return (
    <Container className={className}>
      <div className="button-up" onClick={() => onChange(nextValue())}>
        <KeyboardArrowUp />
      </div>
      <Value onWheel={handleWheel}>{value}</Value>
      <div className="button-down" onClick={() => onChange(prevValue())}>
        <KeyboardArrowDown />
      </div>
    </Container>
  )
}
