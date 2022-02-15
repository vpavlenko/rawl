import styled from "@emotion/styled"
import { Button } from "@mui/material"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

const StyledButton = styled(Button)`
  min-width: auto;
  padding: 0 0.7rem;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  text-transform: none;
  height: 2rem;
  overflow: hidden;
  white-space: nowrap;
`

export const EventListButton: FC = () => {
  const { pianoRollStore } = useStores()

  return (
    <StyledButton
      onClick={useCallback(() => {
        pianoRollStore.showEventList = !pianoRollStore.showEventList
      }, [])}
    >
      {localized("event-list", "Event List")}
    </StyledButton>
  )
}
