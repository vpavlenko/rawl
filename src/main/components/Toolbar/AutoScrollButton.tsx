import styled from "@emotion/styled"
import KeyboardTab from "mdi-react/KeyboardTabIcon"
import { FC } from "react"
import { Localized } from "../../../components/Localized"
import { Tooltip } from "../../../components/Tooltip"
import { ToolbarButton } from "./ToolbarButton"

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`

export interface AutoScrollButtonProps {
  onClick: () => void
  selected: boolean
}

export const AutoScrollButton: FC<AutoScrollButtonProps> = ({
  onClick,
  selected,
}) => (
  <Tooltip title={<Localized default="Auto-Scroll">auto-scroll</Localized>}>
    <ToolbarButton onClick={onClick} selected={selected}>
      <AutoScrollIcon />
    </ToolbarButton>
  </Tooltip>
)
