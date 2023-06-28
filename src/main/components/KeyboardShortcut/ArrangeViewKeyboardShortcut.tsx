import { FC } from "react"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
  arrangeResetSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"
import { KeyboardShortcut } from "./KeyboardShortcut"

const SCROLL_DELTA = 24

export const ArrangeViewKeyboardShortcut: FC = () => {
  const rootStore = useStores()
  const { arrangeViewStore } = rootStore

  return (
    <KeyboardShortcut
      actions={[
        { code: "Escape", run: () => arrangeResetSelection(rootStore)() },
        { code: "Delete", run: () => arrangeDeleteSelection(rootStore)() },
        { code: "Backspace", run: () => arrangeDeleteSelection(rootStore)() },
        {
          code: "ArrowUp",
          metaKey: true,
          run: () => arrangeViewStore.scrollBy(0, SCROLL_DELTA),
        },
        {
          code: "ArrowDown",
          metaKey: true,
          run: () => arrangeViewStore.scrollBy(0, -SCROLL_DELTA),
        },
        {
          code: "KeyT",
          run: () => (arrangeViewStore.openTransposeDialog = true),
        },
      ]}
      onCut={() => {
        arrangeCopySelection(rootStore)()
        arrangeDeleteSelection(rootStore)()
      }}
      onCopy={() => arrangeCopySelection(rootStore)()}
      onPaste={() => arrangePasteSelection(rootStore)()}
    />
  )
}
