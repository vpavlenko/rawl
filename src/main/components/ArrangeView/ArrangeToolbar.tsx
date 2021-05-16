import { AppBar, IconButton, makeStyles, Toolbar } from "@material-ui/core"
import { KeyboardTab, Menu as MenuIcon } from "@material-ui/icons"
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

const NavBackButton = styled(IconButton)`
  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
`

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

  const onClickNavBack = useCallback(
    () => (rootStore.rootViewStore.openDrawer = true),
    [rootStore.rootViewStore]
  )

  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <NavBackButton onClick={onClickNavBack}>
          <MenuIcon />
        </NavBackButton>

        <Title>{localized("arrangement-view", "Arrangement View")}</Title>

        <Spacer />

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
