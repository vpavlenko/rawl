import { observer } from "mobx-react-lite"
import { FC } from "react"
import { LoadingDialog } from "../../../components/LoadingDialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { InitializationPhase } from "../../stores/RootStore"

export const InitializeLoadingDialog: FC = observer(() => {
  const { initializationPhase } = useStores()

  return (
    <LoadingDialog open={isShow(initializationPhase)}>
      <Message phase={initializationPhase} />
    </LoadingDialog>
  )
})

const Message: FC<{ phase: InitializationPhase }> = ({ phase }) => {
  switch (phase) {
    case "initializing":
      return <Localized default="Initializing...">initializing</Localized>
    case "loadExternalMidi":
      return (
        <Localized default="Loading external midi file...">
          loading-external-midi
        </Localized>
      )
    default:
      return null
  }
}

const isShow = (initializationPhase: InitializationPhase) => {
  switch (initializationPhase) {
    case "initializing":
    case "loadExternalMidi":
      return true
    default:
      return false
  }
}
