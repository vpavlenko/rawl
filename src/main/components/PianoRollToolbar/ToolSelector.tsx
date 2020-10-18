import { makeStyles } from "@material-ui/core"
import { Create } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import { useStores } from "main/hooks/useStores"
import { useObserver } from "mobx-react-lite"
import React, { useCallback } from "react"
import styled from "styled-components"
import SelectIcon from "../../images/select.svg"

const useStyles = makeStyles((theme) => ({
  toggleButtonGroup: {
    backgroundColor: "transparent",
    marginRight: "1rem",
  },
}))

const SelectionToolIcon = styled(SelectIcon)`
  width: 1rem;
  fill: currentColor;
`

export const StyledToggleButton = styled(ToggleButton)`
  height: 2rem;
  color: var(--text-color);
  font-size: 1rem;
  padding: 0 0.7rem;
  &.mui-selected {
    background: var(--theme-color);
  }
`

export const ToolSelector = () => {
  const { rootStore: stores } = useStores()
  const { pianoRollStore: s } = stores

  const { mouseMode } = useObserver(() => ({
    mouseMode: stores.pianoRollStore.mouseMode,
  }))

  const onClickPencil = useCallback(() => (s.mouseMode = "pencil"), [s])
  const onClickSelection = useCallback(() => (s.mouseMode = "selection"), [s])

  const classes = useStyles({})
  return (
    <ToggleButtonGroup value={mouseMode} className={classes.toggleButtonGroup}>
      <StyledToggleButton onClick={onClickPencil} value="pencil">
        <Create
          style={{
            width: "1rem",
          }}
        />
      </StyledToggleButton>
      <StyledToggleButton onClick={onClickSelection} value="selection">
        <SelectionToolIcon viewBox="0 0 24 24" />
      </StyledToggleButton>
    </ToggleButtonGroup>
  )
}
