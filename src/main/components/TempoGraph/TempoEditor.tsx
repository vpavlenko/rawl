import React, { FC } from "react"

import { TempoGraph } from "./TempoGraph"
import styled from "styled-components"
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
