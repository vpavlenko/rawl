import { Button } from "@material-ui/core"
import { VerticalSplit } from "@material-ui/icons"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"

const StyledButton = styled(Button)`
  min-width: auto;
  padding: 0 0.7rem;
  border: 1px solid var(--divider-color);
  text-transform: none;
  height: 2rem;
  overflow: hidden;
`

export const EventListButton: FC = () => {
  const { pianoRollStore } = useStores()

  return (
    <StyledButton
      onClick={useCallback(() => {
        pianoRollStore.showEventList = !pianoRollStore.showEventList
      }, [])}
    >
      <VerticalSplit />
    </StyledButton>
  )
}
