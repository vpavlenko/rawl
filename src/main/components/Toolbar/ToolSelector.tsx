import { Create } from "@mui/icons-material"
import { ToggleButton, ToggleButtonGroup } from "@mui/lab"
import { Tooltip } from "@mui/material"
import React, { useCallback, VFC } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { PianoRollMouseMode } from "../../stores/PianoRollStore"
import { SelectionToolIcon } from "./SelectionToolIcon"

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  background-color: transparent;
  margin-right: 1rem;
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
  return (
    <StyledToggleButtonGroup value={mouseMode}>
      <StyledToggleButton
        onClick={useCallback(() => onSelect("pencil"), [])}
        value="pencil"
      >
        <Tooltip title={`${localized("pencil-tool", "Pencil Tool")} [1]`}>
          <Create style={{ width: "1rem" }} />
        </Tooltip>
      </StyledToggleButton>
      <StyledToggleButton
        onClick={useCallback(() => onSelect("selection"), [])}
        value="selection"
      >
        <Tooltip title={`${localized("selection-tool", "Selection Tool")} [2]`}>
          <SelectionToolIcon style={{ width: "1rem" }} />
        </Tooltip>
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  )
}
