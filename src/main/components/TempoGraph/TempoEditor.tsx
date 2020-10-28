import React, { FC } from "react"
import styled from "styled-components"
import { TempoGraph } from "./TempoGraph"
import { TempoGraphToolbar } from "./TempoGraphToolbar"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

export const TempoEditor: FC = () => {
  return (
    <Container>
      <TempoGraphToolbar />
      <TempoGraph />
    </Container>
  )
}
