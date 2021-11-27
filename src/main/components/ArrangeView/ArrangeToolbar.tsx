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
  const { arrangeViewStore } = useStores()
  const { quantize, autoScroll } = arrangeViewStore

  const onClickAutoScroll = useCallback(
    () => (arrangeViewStore.autoScroll = !arrangeViewStore.autoScroll),
    [arrangeViewStore]
  )

  const onSelectQuantize = useCallback(
    (e) => (arrangeViewStore.quantize = e.denominator),
    [arrangeViewStore]
  )

  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <Title>{localized("arrangement-view", "Arrangement View")}</Title>

        <FlexibleSpacer />

        <QuantizeSelector
          value={quantize}
          enabled={true}
          onSelect={(value) => onSelectQuantize({ denominator: value })}
          onClickSwitch={() => {}}
        />

        <AutoScrollButton onClick={onClickAutoScroll} selected={autoScroll} />
      </Toolbar>
    </AppBar>
  )
})
