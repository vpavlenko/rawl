import { AppBar, makeStyles, Toolbar } from "@material-ui/core"
import { KeyboardTab } from "@material-ui/icons"
import { ToggleButton } from "@material-ui/lab"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

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

const AutoScrollButton = styled(ToggleButton)`
  height: 2rem;
  color: var(--text-color);
  font-size: 1rem;
  &.MuiToggleButton-root.Mui-selected {
    background: var(--theme-color);
  }
  svg {
    font-size: 1.3rem;
  }
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
          value="autoScroll"
          onClick={() => (tempoEditorStore.autoScroll = !autoScroll)}
          selected={autoScroll}
        >
          <KeyboardTab />
        </AutoScrollButton>
      </Toolbar>
    </AppBar>
  )
})
