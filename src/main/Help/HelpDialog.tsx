import React, { FC, ReactNode } from "react"
import { useStores } from "../hooks/useStores"
import { useObserver } from "mobx-react-lite"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core"
import { localized } from "../../common/localize/localizedString"
import styled from "styled-components"

interface HotKeyProps {
  hotKeys: string[]
  text: string
}

const HotKeyContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  span {
    margin: 0 0.3em;
  }
`

const Key = styled.div`
  display: inline-block;
  border: 1px solid white;
  border-radius: 4px;
  padding: 0.1em 0.5em 0.2em 0.5em;
  background: var(--text-color);
  color: var(--background-color);
  box-shadow: inset 0 -2px 0 0px #0000006b;
`

const HotKeyText = styled.div`
  margin-left: 1em;
`

const HotKey: FC<HotKeyProps> = ({ hotKeys, text }) => {
  return (
    <HotKeyContainer>
      {hotKeys
        .map<ReactNode>((k, i) => <Key key={i}>{k}</Key>)
        .reduce((prev, curr) => [prev, <span key={999}>+</span>, curr])}
      <HotKeyText>{text}</HotKeyText>
    </HotKeyContainer>
  )
}

export const HelpDialog: FC = () => {
  const { rootStore } = useStores()
  const { isOpen } = useObserver(() => ({
    isOpen: rootStore.rootViewStore.openHelp,
  }))
  const close = () => (rootStore.rootViewStore.openHelp = false)

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{localized("help", "Help")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {localized("keyboard-shortcut", "Keyboard Shortcut")}
        </DialogContentText>
        <HotKey
          hotKeys={["Space"]}
          text={localized("play-stop", "Play/Stop")}
        />
        <HotKey
          hotKeys={["1"]}
          text={localized("pencil-tool", "Pencil Tool")}
        />
        <HotKey
          hotKeys={["2"]}
          text={localized("selection-tool", "Selection Tool")}
        />
        <HotKey
          hotKeys={["Cmd", "C"]}
          text={localized("copy-selection", "Copy Selection")}
        />
        <HotKey
          hotKeys={["Cmd", "X"]}
          text={localized("cut-selection", "Cut Selection")}
        />
        <HotKey
          hotKeys={["Cmd", "V"]}
          text={localized(
            "paste-selection",
            "Paste Copied Selection to Current Position"
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
}
