import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core"
import { useObserver } from "mobx-react-lite"
import React, { FC } from "react"
import styled from "styled-components"
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

// to hide incomplete feature
const Invisible = styled.div`
  display: none;
`

export const MIDIDeviceDialog: FC = () => {
  const rootStore = useStores()

  const {
    inputs,
    outputs,
    isLoading,
    isOpen,
    enabledInputIds,
    enabledOutputIds,
    isFactorySoundEnabled,
  } = useObserver(() => ({
    inputs: rootStore.midiDeviceStore.inputs,
    outputs: rootStore.midiDeviceStore.outputs,
    isLoading: rootStore.midiDeviceStore.isLoading,
    enabledInputIds: rootStore.midiDeviceStore.enabledInputIds,
    enabledOutputIds: rootStore.midiDeviceStore.enabledOutputIds,
    isFactorySoundEnabled: rootStore.midiDeviceStore.isFactorySoundEnabled,
    isOpen: rootStore.rootViewStore.openDeviceDialog,
  }))

  const close = () => (rootStore.rootViewStore.openDeviceDialog = false)

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
    isSelected: enabledInputIds.has(device.id),
  }))

  const outputDevices = outputs.map((device) => ({
    device: portToDevice(device),
    isSelected: enabledOutputIds.has(device.id),
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
        {!isLoading && (
          <>
            <Invisible>
              <DialogContentText>
                {localized("inputs", "Inputs")}
              </DialogContentText>
              <DeviceList>
                {inputDevices.map(({ device, isSelected }) => (
                  <DeviceRow
                    device={device}
                    isSelected={isSelected}
                    onCheck={(checked) =>
                      rootStore.midiDeviceStore.setInputEnable(
                        device.id,
                        checked
                      )
                    }
                  />
                ))}
              </DeviceList>
              <Spacer />
            </Invisible>
            <DialogContentText>
              {localized("outputs", "Outputs")}
            </DialogContentText>
            <DeviceList>
              <DeviceRow
                device={factorySound}
                isSelected={isFactorySoundEnabled}
                onCheck={(checked) =>
                  (rootStore.midiDeviceStore.isFactorySoundEnabled = checked)
                }
              />
              {outputDevices.map(({ device, isSelected }) => (
                <DeviceRow
                  device={device}
                  isSelected={isSelected}
                  onCheck={(checked) =>
                    rootStore.midiDeviceStore.setOutputEnable(
                      device.id,
                      checked
                    )
                  }
                />
              ))}
            </DeviceList>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
}
