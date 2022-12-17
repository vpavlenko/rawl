import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Alert } from "../../../../components/Alert"
import { Checkbox } from "../../../../components/Checkbox"
import { CircularProgress } from "../../../../components/CircularProgress"
import { DialogContent, DialogTitle } from "../../../../components/Dialog"
import { Label } from "../../../../components/Label"
import { Localized } from "../../../../components/Localized"
import { useStores } from "../../../hooks/useStores"

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

const DeviceRow: FC<ListItem> = ({ device, isSelected, onCheck }) => {
  return (
    <Label
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(state) => onCheck(state === true)}
        style={{ marginRight: "0.5rem" }}
        label={
          <>
            {device.name}
            {!device.isConnected && " (disconnected)"}
          </>
        }
      />
    </Label>
  )
}

const DeviceList = styled.div``

const Notice = styled.div`
  color: ${({ theme }) => theme.secondaryTextColor};
`

const Spacer = styled.div`
  height: 2rem;
`

const SectionTitle = styled.div`
  font-weight: bold;
  margin: 1rem 0;
`

export const MIDIDeviceView: FC = observer(() => {
  const { midiDeviceStore } = useStores()

  const {
    inputs,
    outputs,
    isLoading,
    requestError,
    enabledInputs,
    enabledOutputs,
    isFactorySoundEnabled,
  } = midiDeviceStore

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
    <>
      <DialogTitle>
        <Localized default="MIDI Settings">midi-settings</Localized>
      </DialogTitle>
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
            <SectionTitle>
              <Localized default="Inputs">inputs</Localized>
            </SectionTitle>
            <DeviceList>
              {inputDevices.length === 0 && (
                <Notice>
                  <Localized default="No input device found">
                    no-inputs
                  </Localized>
                </Notice>
              )}
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
                <SectionTitle>
                  <Localized default="Outputs">outputs</Localized>
                </SectionTitle>
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
    </>
  )
})
