import styled from "@emotion/styled"
import { Add } from "@mui/icons-material"
import { ListItemIcon, ListItemText } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { addTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  color: ${({ theme }) => theme.secondaryTextColor};

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const AddTrackListIcon = styled(ListItemIcon)`
  min-width: auto;
  margin-right: 0.6em;
  color: inherit;
`

export const AddTrackButton: FC = observer(() => {
  const rootStore = useStores()

  const onClickAddTrack = useCallback(() => addTrack(rootStore)(), [])

  return (
    <Wrapper onClick={onClickAddTrack}>
      <AddTrackListIcon>
        <Add />
      </AddTrackListIcon>
      <ListItemText primary={localized("add-track", "Add track")} />
    </Wrapper>
  )
})
