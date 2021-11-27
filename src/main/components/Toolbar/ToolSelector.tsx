import { makeStyles } from "@material-ui/core"
import { Create } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import { useCallback, VFC } from "react"
import styled from "styled-components"
import SelectIcon from "../../images/select.svg"
import { PianoRollMouseMode } from "../../stores/PianoRollStore"

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
  &.Mui-selected {
    background: var(--theme-color);
  }
`

StyledToggleButton.defaultProps = {
  value: "",
}

export interface ToolSelectorProps {
  mouseMode: PianoRollMouseMode
  onSelect: (mouseMode: PianoRollMouseMode) => void
}

export const ToolSelector: VFC<ToolSelectorProps> = ({
  mouseMode,
  onSelect,
}) => {
  const classes = useStyles({})

  return (
    <ToggleButtonGroup value={mouseMode} className={classes.toggleButtonGroup}>
      <StyledToggleButton
        onClick={useCallback(() => onSelect("pencil"), [])}
        value="pencil"
      >
        <Create style={{ width: "1rem" }} />
      </StyledToggleButton>
      <StyledToggleButton
        onClick={useCallback(() => onSelect("selection"), [])}
        value="selection"
      >
        <SelectionToolIcon viewBox="0 0 24 24" />
      </StyledToggleButton>
    </ToggleButtonGroup>
  )
}
