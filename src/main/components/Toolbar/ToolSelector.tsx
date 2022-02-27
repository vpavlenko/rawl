import styled from "@emotion/styled"
import { Create } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import React, { useCallback, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { PianoRollMouseMode } from "../../stores/PianoRollStore"
import { SelectionToolIcon } from "./SelectionToolIcon"
import {
  ToolbarButtonGroup,
  ToolbarButtonGroupItem,
} from "./ToolbarButtonGroup"

const ButtonGroup = styled(ToolbarButtonGroup)`
  background-color: transparent;
  margin-right: 1rem;
`

export interface ToolSelectorProps {
  mouseMode: PianoRollMouseMode
  onSelect: (mouseMode: PianoRollMouseMode) => void
}

export const ToolSelector: VFC<ToolSelectorProps> = ({
  mouseMode,
  onSelect,
}) => {
  return (
    <ButtonGroup>
      <ToolbarButtonGroupItem
        onClick={useCallback(() => onSelect("pencil"), [])}
        selected={mouseMode === "pencil"}
      >
        <Tooltip title={`${localized("pencil-tool", "Pencil Tool")} [1]`}>
          <Create style={{ width: "1rem" }} />
        </Tooltip>
      </ToolbarButtonGroupItem>
      <ToolbarButtonGroupItem
        onClick={useCallback(() => onSelect("selection"), [])}
        selected={mouseMode === "selection"}
      >
        <Tooltip title={`${localized("selection-tool", "Selection Tool")} [2]`}>
          <SelectionToolIcon style={{ width: "1rem" }} />
        </Tooltip>
      </ToolbarButtonGroupItem>
    </ButtonGroup>
  )
}
