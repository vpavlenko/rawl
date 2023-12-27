import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { CircularProgress } from "../../../components/CircularProgress"
import { Dialog, DialogContent } from "../../../components/Dialog"
import { useStores } from "../../hooks/useStores"

const Message = styled.div`
  color: ${({ theme }) => theme.textColor};
  margin-left: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
`

export const LoadingDialog: FC = observer(() => {
  const rootStore = useStores()
  const { rootViewStore } = rootStore
  const { openLoadingDialog: open, loadingDialogMessage } = rootViewStore

  return (
    <Dialog open={open} style={{ minWidth: "20rem" }}>
      <DialogContent style={{ display: "flex", marginBottom: "0" }}>
        <CircularProgress />
        <Message>{loadingDialogMessage ?? "Loading..."}</Message>
      </DialogContent>
    </Dialog>
  )
})
