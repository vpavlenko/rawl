import styled from "@emotion/styled"
import { Tooltip } from "@mui/material"
import { useCallback, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import PencilIcon from "../../images/icons/pencil.svg"
import SelectionIcon from "../../images/icons/selection.svg"
import { PianoRollMouseMode } from "../../stores/PianoRollStore"
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

const IconWrapper = styled.div`
  display: flex;
`

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
          <IconWrapper>
            <PencilIcon
              style={{
                width: "1.3rem",
                height: "1.3rem",
                fill: "currentColor",
              }}
              viewBox="0 0 128 128"
            />
          </IconWrapper>
        </Tooltip>
      </ToolbarButtonGroupItem>
      <ToolbarButtonGroupItem
        onClick={useCallback(() => onSelect("selection"), [])}
        selected={mouseMode === "selection"}
      >
        <Tooltip title={`${localized("selection-tool", "Selection Tool")} [2]`}>
          <IconWrapper>
            <SelectionIcon
              style={{ width: "1.3rem", fill: "currentColor" }}
              viewBox="0 0 128 128"
            />
          </IconWrapper>
        </Tooltip>
      </ToolbarButtonGroupItem>
    </ButtonGroup>
  )
}
