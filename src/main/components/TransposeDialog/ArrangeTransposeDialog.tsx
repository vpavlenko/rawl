import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { arrangeTransposeSelection } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { TransposeDialog } from "./TransposeDialog"

export const ArrangeTransposeDialog = observer(() => {
  const rootStore = useStores()
  const { arrangeViewStore } = rootStore
  const { openTransposeDialog } = arrangeViewStore

  const onClose = useCallback(
    () => (arrangeViewStore.openTransposeDialog = false),
    [arrangeViewStore],
  )

  const onClickOK = useCallback(
    (value: number) => {
      arrangeTransposeSelection(rootStore)(value)
      arrangeViewStore.openTransposeDialog = false
    },
    [arrangeViewStore],
  )

  return (
    <TransposeDialog
      open={openTransposeDialog}
      onClose={onClose}
      onClickOK={onClickOK}
    />
  )
})
