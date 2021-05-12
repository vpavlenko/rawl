import { AppBar, makeStyles, Toolbar } from "@material-ui/core"
import { KeyboardTab } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import QuantizeSelector from "../PianoRollToolbar/QuantizeSelector/QuantizeSelector"
import { StyledToggleButton } from "../PianoRollToolbar/ToolSelector"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
}))

const Spacer = styled.div`
  width: 1rem;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
  min-width: 3em;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const ArrangeToolbar: FC = observer(() => {
  const rootStore = useStores()
  const quantize =
    rootStore.arrangeViewStore.quantize === 0
      ? rootStore.services.quantizer.denominator
      : rootStore.arrangeViewStore.quantize
  const autoScroll = rootStore.arrangeViewStore.autoScroll

  const onClickAutoScroll = useCallback(
    () =>
      (rootStore.arrangeViewStore.autoScroll =
        !rootStore.arrangeViewStore.autoScroll),
    []
  )

  const onSelectQuantize = useCallback((e) => {
    rootStore.services.quantizer.denominator = e.denominator
    rootStore.arrangeViewStore.quantize = e.denominator
  }, [])

  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <Title>{localized("arrangement-view", "Arrangement View")}</Title>

        <FlexibleSpacer />

        <QuantizeSelector
          value={quantize}
          onSelect={(value) => onSelectQuantize({ denominator: value })}
        />

        <StyledToggleButton onClick={onClickAutoScroll} selected={autoScroll}>
          <KeyboardTab />
        </StyledToggleButton>
      </Toolbar>
    </AppBar>
  )
})
