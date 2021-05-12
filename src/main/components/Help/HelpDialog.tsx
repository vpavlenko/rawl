import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { FC, ReactNode } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

interface HotKeyProps {
  hotKeys: string[][]
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
        .map((c, i1) =>
          c
            .map<ReactNode>((k, i2) => <Key key={i1 * 10000 + i2}>{k}</Key>)
            .reduce((a, b) => [a, <span key={"plus"}>+</span>, b])
        )
        .reduce((a, b) => [a, <span key={"slash"}>/</span>, b])}
      <HotKeyText>{text}</HotKeyText>
    </HotKeyContainer>
  )
}

export const HelpDialog: FC = observer(() => {
  const { rootViewStore } = useStores()
  const isOpen = rootViewStore.openHelp

  const close = () => (rootViewStore.openHelp = false)

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{localized("help", "Help")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {localized("keyboard-shortcut", "Keyboard Shortcut")}
        </DialogContentText>
        <HotKey
          hotKeys={[["Space"]]}
          text={localized("play-stop", "Play/Stop")}
        />
        <HotKey
          hotKeys={[["1"]]}
          text={localized("pencil-tool", "Pencil Tool")}
        />
        <HotKey
          hotKeys={[["2"]]}
          text={localized("selection-tool", "Selection Tool")}
        />
        <HotKey
          hotKeys={[["↑"], ["↓"]]}
          text={localized("move-selection", "Move selection")}
        />
        <HotKey
          hotKeys={[["←"], ["→"]]}
          text={localized("select-note", "Select note")}
        />
        <HotKey
          hotKeys={[
            ["Cmd", "↑"],
            ["Cmd", "↓"],
          ]}
          text={localized("scroll-vertically", "Scroll Vertically")}
        />
        <HotKey
          hotKeys={[
            ["Cmd", "←"],
            ["Cmd", "→"],
          ]}
          text={localized("scroll-horizontally", "Scroll Horizontally")}
        />
        <HotKey hotKeys={[["Cmd", "Z"]]} text={localized("undo", "Undo")} />
        <HotKey
          hotKeys={[
            ["Cmd", "Y"],
            ["Cmd", "Shift", "Z"],
          ]}
          text={localized("redo", "Redo")}
        />
        <HotKey
          hotKeys={[["Cmd", "C"]]}
          text={localized("copy-selection", "Copy Selection")}
        />
        <HotKey
          hotKeys={[["Delete"], ["Backspace"]]}
          text={localized("delete-selection", "Delete Selection")}
        />
        <HotKey
          hotKeys={[["Cmd", "X"]]}
          text={localized("cut-selection", "Cut Selection")}
        />
        <HotKey
          hotKeys={[["Cmd", "V"]]}
          text={localized(
            "paste-selection",
            "Paste Copied Selection to Current Position"
          )}
        />
        <HotKey hotKeys={[["?"]]} text={localized("open-help", "Open Help")} />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})
