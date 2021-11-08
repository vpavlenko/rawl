import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"
import { FC } from "react"
import styled from "styled-components"

export interface NumberPickerProps {
  value: number
  prevValue: () => number
  nextValue: () => number
  className?: string
  onChange: (v: number) => void
}

const Value = styled.div`
  font-size: 150%;
  background: var(--background-color);
  border: 1px solid var(--divider-color);
  width: 2em;
  padding: 0.25em;
  text-align: center;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    color: var(--secondary-text-color);
  }

  svg:hover {
    color: var(--text-color);
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
