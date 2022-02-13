import styled from "@emotion/styled"
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

interface Device {
  id: string
  name: string
  isConnected: boolean
}

interface ListItem {
  device: Device
  isSelected: boolean
  onCheck: (isChecked: boolean) => void
}

const DeviceRowWrapper = styled.div`
  display: flex;
  align-items: center;
`

const DeviceRow: FC<ListItem> = ({ device, isSelected, onCheck }) => {
  return (
    <DeviceRowWrapper>
      <Checkbox
        color="primary"
        checked={isSelected}
        onChange={(e) => onCheck(e.currentTarget.checked)}
      />
      {device.name}
      {!device.isConnected && " (disconnected)"}
    </DeviceRowWrapper>
  )
}

const DeviceList = styled.div``

const Spacer = styled.div`
  height: 2rem;
`

export const MIDIDeviceDialog: FC = observer(() => {
  const { midiDeviceStore, rootViewStore } = useStores()

  const {
    inputs,
    outputs,
    isLoading,
    requestError,
    enabledInputs,
    enabledOutputs,
    isFactorySoundEnabled,
  } = midiDeviceStore
  const isOpen = rootViewStore.openDeviceDialog

  const close = () => (rootViewStore.openDeviceDialog = false)

  const formatName = (device: WebMidi.MIDIPort) =>
    (device?.name ?? "") +
    ((device.manufacturer?.length ?? 0) > 0 ? `(${device.manufacturer})` : "")

  const portToDevice = (device: WebMidi.MIDIPort): Device => ({
    id: device.id,
    name: formatName(device),
    isConnected: device.state === "connected",
  })

  const inputDevices = inputs.map((device) => ({
    device: portToDevice(device),
    isSelected: enabledInputs[device.id],
  }))

  const outputDevices = outputs.map((device) => ({
    device: portToDevice(device),
    isSelected: enabledOutputs[device.id],
  }))

  const factorySound: Device = {
    id: "signal-midi-app",
    name: "Signal Factory Sound",
    isConnected: true,
  }

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{localized("midi-settings", "MIDI Settings")}</DialogTitle>
      <DialogContent>
        {isLoading && <CircularProgress />}
        {requestError && (
          <>
            <Alert severity="warning">{requestError.message}</Alert>
            <Spacer />
          </>
        )}
        {!isLoading && (
          <>
            <DialogContentText>
              {localized("inputs", "Inputs")}
            </DialogContentText>
            <DeviceList>
              {inputDevices.map(({ device, isSelected }) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  isSelected={isSelected}
                  onCheck={(checked) =>
                    midiDeviceStore.setInputEnable(device.id, checked)
                  }
                />
              ))}
            </DeviceList>
            {
              <>
                <Spacer />
                <DialogContentText>
                  {localized("outputs", "Outputs")}
                </DialogContentText>
                <DeviceList>
                  <DeviceRow
                    device={factorySound}
                    isSelected={isFactorySoundEnabled}
                    onCheck={(checked) =>
                      (midiDeviceStore.isFactorySoundEnabled = checked)
                    }
                  />
                  {outputDevices.map(({ device, isSelected }) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      isSelected={isSelected}
                      onCheck={(checked) =>
                        midiDeviceStore.setOutputEnable(device.id, checked)
                      }
                    />
                  ))}
                </DeviceList>
              </>
            }
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})
