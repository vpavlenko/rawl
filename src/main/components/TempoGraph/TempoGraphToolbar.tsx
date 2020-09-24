import { AppBar, IconButton, makeStyles, Toolbar } from "@material-ui/core"
import { KeyboardTab, Menu as MenuIcon } from "@material-ui/icons"
import { ToggleButton } from "@material-ui/lab"
import { useObserver } from "mobx-react"
import React, { FC } from "react"
import styled from "styled-components"
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

export const TempoGraphToolbar: FC = () => {
  const { rootStore: stores } = useStores()
  const { autoScroll } = useObserver(() => ({
    autoScroll: stores.tempoEditorStore.autoScroll,
  }))
  const onClickNavBack = () => (stores.rootViewStore.openDrawer = true)
  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <IconButton onClick={onClickNavBack} color="inherit">
          <MenuIcon />
        </IconButton>

        <Title>Tempo</Title>

        <AutoScrollButton
          color="inherit"
          onClick={() => (stores.tempoEditorStore.autoScroll = !autoScroll)}
          selected={autoScroll}
        >
          <KeyboardTab />
        </AutoScrollButton>
      </Toolbar>
    </AppBar>
  )
}
