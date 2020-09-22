import React, { FC } from "react"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./PianoRollToolbar"

import styled from "styled-components"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const PianoRollEditor: FC = () => {
  return (
    <Container>
      <PianoRollToolbar />
      <PianoRoll />
    </Container>
  )
}

export default PianoRollEditor
