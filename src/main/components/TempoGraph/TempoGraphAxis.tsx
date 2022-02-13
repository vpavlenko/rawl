import styled from "@emotion/styled"
import range from "lodash/range"
import { FC } from "react"
import { TempoCoordTransform } from "../../../common/transform"

const Container = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${({ theme }) => theme.backgroundColor};
  pointer-events: none;
  border-right: 1px solid ${({ theme }) => theme.dividerColor};
  box-shadow: 0px 0px 5px 0 rgba(0, 0, 0, 0.1);
`

const Values = styled.div`
  position: relative;

  & > div {
    position: absolute;
    text-align: right;
    width: 100%;
    padding-right: 1em;
    box-sizing: border-box;
    font-size: 90%;
    margin-top: -0.5em;
  }
`

interface TempoGraphAxisProps {
  width: number
  transform: TempoCoordTransform
  offset: number
}

export const TempoGraphAxis: FC<TempoGraphAxisProps> = ({
  width,
  transform,
  offset,
}) => {
  return (
    <Container style={{ width }}>
      <Values>
        {range(30, transform.maxBPM, 30).map((t) => {
          const top = Math.round(transform.getY(t)) + offset
          return (
            <div style={{ top }} key={t}>
              {t}
            </div>
          )
        })}
      </Values>
    </Container>
  )
}
