import React, { FC } from "react"
import styled from "styled-components"
import { PianoRollToolbar } from "../PianoRollToolbar/PianoRollToolbar"
import PianoRoll from "./PianoRoll"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const PianoRollEditor: FC = () => {
  return (
    <Container>
      <PianoRollToolbar />
      <PianoRoll />
    </Container>
  )
}
