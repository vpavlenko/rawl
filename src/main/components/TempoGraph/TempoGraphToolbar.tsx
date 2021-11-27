import { AppBar, makeStyles, Toolbar } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { AutoScrollButton } from "../PianoRollToolbar/AutoScrollButton"

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
  const autoScroll = tempoEditorStore.autoScroll

  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <Title>{localized("tempo", "Tempo")}</Title>

        <FlexibleSpacer />

        <AutoScrollButton
          onClick={() => (tempoEditorStore.autoScroll = !autoScroll)}
          selected={autoScroll}
        />
      </Toolbar>
    </AppBar>
  )
})
