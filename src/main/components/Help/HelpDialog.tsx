import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, ReactNode } from "react"
import { envString } from "../../../common/localize/envString"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"

interface HotKeyProps {
  hotKeys: string[][]
  text: ReactNode
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
  background: ${({ theme }) => theme.textColor};
  color: ${({ theme }) => theme.backgroundColor};
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
            .reduce((a, b) => [a, <span key={"plus"}>+</span>, b]),
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
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogTitle>
        <Localized default="Help">help</Localized>
      </DialogTitle>
      <DialogContent>
        <h3>
          <Localized default="Keyboard Shortcut">keyboard-shortcut</Localized>
        </h3>
        <HotKey
          hotKeys={[["Space"]]}
          text={<Localized default="Play / Pause">play-pause</Localized>}
        />
        <HotKey
          hotKeys={[["Enter"]]}
          text={<Localized default="Stop">stop</Localized>}
        />
        <HotKey
          hotKeys={[["A"], ["D"]]}
          text={
            <Localized default="Rewind / Forward">forward-rewind</Localized>
          }
        />
        <HotKey
          hotKeys={[["R"]]}
          text={
            <Localized default="Start / Stop Recording">
              start-stop-recording
            </Localized>
          }
        />
        <HotKey
          hotKeys={[["S"], ["W"]]}
          text={
            <Localized default="Next / Previous Track">
              next-previous-track
            </Localized>
          }
        />
        <HotKey
          hotKeys={[["N"], ["M"], [","]]}
          text={
            <Localized default="Solo, Mute or Ghost Track">
              solo-mute-ghost
            </Localized>
          }
        />
        <HotKey
          hotKeys={[["T"]]}
          text={<Localized default="Transpose">transpose</Localized>}
        />
        <HotKey
          hotKeys={[["1"]]}
          text={<Localized default="Pencil Tool">pencil-tool</Localized>}
        />
        <HotKey
          hotKeys={[["2"]]}
          text={<Localized default="Selection Tool">selection-tool</Localized>}
        />
        <HotKey
          hotKeys={[["↑"], ["↓"]]}
          text={<Localized default="Move selection">move-selection</Localized>}
        />
        <HotKey
          hotKeys={[["←"], ["→"]]}
          text={<Localized default="Select note">select-note</Localized>}
        />
        <HotKey
          hotKeys={[
            [envString.cmdOrCtrl, "1"],
            [envString.cmdOrCtrl, "2"],
            [envString.cmdOrCtrl, "3"],
          ]}
          text={<Localized default="Switch Tab">switch-tab</Localized>}
        />
        <HotKey
          hotKeys={[
            [envString.cmdOrCtrl, "↑"],
            [envString.cmdOrCtrl, "↓"],
          ]}
          text={
            <Localized default="Scroll Vertically">scroll-vertically</Localized>
          }
        />
        <HotKey
          hotKeys={[
            [envString.cmdOrCtrl, "←"],
            [envString.cmdOrCtrl, "→"],
          ]}
          text={
            <Localized default="Scroll Horizontally">
              scroll-horizontally
            </Localized>
          }
        />
        <HotKey
          hotKeys={[[envString.cmdOrCtrl, "Z"]]}
          text={<Localized default="Undo">undo</Localized>}
        />
        <HotKey
          hotKeys={[
            [envString.cmdOrCtrl, "Y"],
            [envString.cmdOrCtrl, "Shift", "Z"],
          ]}
          text={<Localized default="Redo">redo</Localized>}
        />
        <HotKey
          hotKeys={[[envString.cmdOrCtrl, "C"]]}
          text={<Localized default="Copy Selection">copy-selection</Localized>}
        />
        <HotKey
          hotKeys={[["Delete"], ["Backspace"]]}
          text={
            <Localized default="Delete Selection">delete-selection</Localized>
          }
        />
        <HotKey
          hotKeys={[[envString.cmdOrCtrl, "X"]]}
          text={<Localized default="Cut Selection">cut-selection</Localized>}
        />
        <HotKey
          hotKeys={[[envString.cmdOrCtrl, "V"]]}
          text={
            <Localized default="Paste Copied Selection to Current Position">
              paste-selection
            </Localized>
          }
        />
        <HotKey
          hotKeys={[[envString.cmdOrCtrl, "A"]]}
          text={<Localized default="Select all">select-all</Localized>}
        />
        <HotKey
          hotKeys={[["?"]]}
          text={<Localized default="Open Help">open-help</Localized>}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})
