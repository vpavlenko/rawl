import { AppBar, makeStyles, Toolbar } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { AutoScrollButton } from "../PianoRollToolbar/AutoScrollButton"
import QuantizeSelector from "../PianoRollToolbar/QuantizeSelector/QuantizeSelector"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
}))

const Title = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const TempoGraphToolbar: FC = observer(() => {
  const { tempoEditorStore } = useStores()
  const { autoScroll, quantize, isQuantizeEnabled } = tempoEditorStore

  const classes = useStyles({})

  const onSelectQuantize = useCallback(
    (denominator: number) => (tempoEditorStore.quantize = denominator),
    [tempoEditorStore]
  )

  const onClickQuantizeSwitch = useCallback(() => {
    tempoEditorStore.isQuantizeEnabled = !tempoEditorStore.isQuantizeEnabled
  }, [tempoEditorStore])

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <Title>{localized("tempo", "Tempo")}</Title>

        <FlexibleSpacer />

        <QuantizeSelector
          value={quantize}
          enabled={isQuantizeEnabled}
          onSelect={onSelectQuantize}
          onClickSwitch={onClickQuantizeSwitch}
        />

        <AutoScrollButton
          onClick={() => (tempoEditorStore.autoScroll = !autoScroll)}
          selected={autoScroll}
        />
      </Toolbar>
    </AppBar>
  )
})
