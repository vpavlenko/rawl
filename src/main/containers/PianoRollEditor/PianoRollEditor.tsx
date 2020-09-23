import React, { FC } from "react"

import styled from "styled-components"
import { PianoRollToolbar } from "main/components/PianoRollToolbar/PianoRollToolbar"
import PianoRoll from "main/components/PianoRoll/PianoRoll"

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
