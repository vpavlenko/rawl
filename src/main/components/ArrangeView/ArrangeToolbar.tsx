import {
  AppBar,
  Divider,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core"
import { ChevronLeft, KeyboardTab } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
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

export const ArrangeToolbar: FC = observer(() => {
  const rootStore = useStores()
  const quantize =
    rootStore.arrangeViewStore.quantize === 0
      ? rootStore.services.quantizer.denominator
      : rootStore.arrangeViewStore.quantize
  const autoScroll = rootStore.arrangeViewStore.autoScroll

  const onClickAutoScroll = useCallback(
    () =>
      (rootStore.arrangeViewStore.autoScroll = !rootStore.arrangeViewStore
        .autoScroll),
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
        <IconButton>
          <ChevronLeft />
        </IconButton>

        <QuantizeSelector
          value={quantize}
          onSelect={(value) => onSelectQuantize({ denominator: value })}
        />

        <Divider orientation="vertical" />

        <StyledToggleButton onClick={onClickAutoScroll} selected={autoScroll}>
          <KeyboardTab />
        </StyledToggleButton>
      </Toolbar>
    </AppBar>
  )
})
