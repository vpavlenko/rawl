import React, { FC } from "react"
import styled from "styled-components"

const Parent = styled.div`
  text-align: right;
  width: var(--key-width);
  border-right: 1px solid var(--divider-color);
  padding-right: 0.3em;
  box-sizing: border-box;
`

const Values = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Value = styled.div`
  padding: 0.3em;
  font-size: 90%;
  color: var(--secondary-text-color);

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    cursor: default;
  }
`

export interface GraphAxisProps {
  axis: number[]
  onClick: (value: number) => void
}

export const GraphAxis: FC<GraphAxisProps> = React.memo(({ axis, onClick }) => {
  return (
    <Parent>
      <Values>
        {axis
          .slice()
          .reverse()
          .map((value) => (
            <Value
              key={value}
              className="AxisValue"
              onClick={() => onClick(value)}
            >
              {value}
            </Value>
          ))}
      </Values>
    </Parent>
  )
})
