import styled from "@emotion/styled"
import { KeyboardTab } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import { VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { ToolbarButton } from "./ToolbarButton"

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`

export interface AutoScrollButtonProps {
  onClick: () => void
  selected: boolean
}

export const AutoScrollButton: VFC<AutoScrollButtonProps> = ({
  onClick,
  selected,
}) => (
  <ToolbarButton onClick={onClick} selected={selected}>
    <Tooltip title={localized("auto-scroll", "Auto-Scroll")}>
      <AutoScrollIcon />
    </Tooltip>
  </ToolbarButton>
)
