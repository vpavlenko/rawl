import { DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"

export const SoundFontSettingsView: FC = observer(() => {
  const { soundFontStore } = useStores()
  const { filenames } = soundFontStore
  // TODO: add open local file dialog and put it to SoundFontStore
  return (
    <>
      <DialogTitle>
        <Localized default="SoundFont">soundfont</Localized>
      </DialogTitle>
      <DialogContent>
        {filenames.map((filename) => {
          return (
            <p
              onClick={async () => {
                await soundFontStore.load(filename)
              }}
            >
              {filename}
            </p>
          )
        })}
      </DialogContent>
    </>
  )
})
