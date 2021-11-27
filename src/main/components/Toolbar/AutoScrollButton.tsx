import { KeyboardTab } from "@material-ui/icons"
import { VFC } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { StyledToggleButton } from "./ToolSelector"

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
  <StyledToggleButton
    onClick={onClick}
    selected={selected}
    value="autoScroll"
    title={localized("auto-scroll", "Auto-Scroll")}
  >
    <AutoScrollIcon />
  </StyledToggleButton>
)
