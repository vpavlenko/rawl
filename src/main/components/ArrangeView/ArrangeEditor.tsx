import React, { FC } from "react"
import styled from "styled-components"
import { ArrangeViewKeyboardShortcut } from "../KeyboardShortcut/ArrangeViewKeyboardShortcut"
import { ArrangeToolbar } from "./ArrangeToolbar"
import { ArrangeView } from "./ArrangeView"

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
`

export const ArrangeEditor: FC = () => {
  return (
    <Container>
      <ArrangeViewKeyboardShortcut />
      <ArrangeToolbar />
      <ArrangeView />
    </Container>
  )
}
