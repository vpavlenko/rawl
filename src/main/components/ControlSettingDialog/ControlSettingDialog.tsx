import styled from "@emotion/styled"
import { range } from "lodash"
import ChevronDoubleLeftIcon from "mdi-react/ChevronDoubleLeftIcon"
import ChevronDoubleRightIcon from "mdi-react/ChevronDoubleRightIcon"
import { observer } from "mobx-react-lite"
import { useCallback, useState } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { ControlMode, isEqualControlMode } from "../../stores/ControlStore"
import { ControlName } from "../ControlPane/ControlName"

const getAllControlModes = (): ControlMode[] =>
  range(0, 128).map((i) => ({ type: "controller", controllerType: i }))

const Item = styled.div<{ isSelected: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.themeColor : "transparent"};
  white-space: nowrap;
`

const Content = styled.div`
  max-height: 30rem;
  display: flex;
`

const Pane = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  overflow: auto;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
`

const CenterPane = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const InsertButton = styled(Button)`
  background: ${({ theme }) => theme.secondaryBackgroundColor};
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  min-width: 7rem;
  justify-content: center;
`

export const ControlSettingDialog = observer(() => {
  const rootStore = useStores()
  const { rootViewStore, controlStore } = rootStore
  const { openControlSettingDialog: open } = rootViewStore
  const [selectedLeftMode, setSelectedLeftMode] = useState<ControlMode | null>(
    null,
  )
  const [selectedRightMode, setSelectedRightMode] =
    useState<ControlMode | null>(null)

  const leftModes = controlStore.controlModes

  const rightModes = getAllControlModes().filter(
    (mode) =>
      !controlStore.controlModes.some((m) => isEqualControlMode(m, mode)),
  )

  const leftItems = leftModes.map((mode) => ({
    mode,
    isSelected:
      selectedLeftMode !== null && isEqualControlMode(mode, selectedLeftMode),
  }))

  const rightItems = rightModes.map((mode) => ({
    mode,
    isSelected:
      selectedRightMode !== null && isEqualControlMode(mode, selectedRightMode),
  }))

  const onClose = useCallback(
    () => (rootViewStore.openControlSettingDialog = false),
    [rootViewStore],
  )

  const onClickAdd = () => {
    if (selectedRightMode) {
      controlStore.controlModes.push(selectedRightMode)
    }
  }

  const onClickRemove = () => {
    if (selectedLeftMode) {
      controlStore.controlModes = controlStore.controlModes.filter(
        (mode) => !isEqualControlMode(mode, selectedLeftMode),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ maxWidth: "40rem" }}>
      <DialogTitle>
        <Localized default="Control Settings">control-settings</Localized>
      </DialogTitle>
      <DialogContent>
        <Content>
          <Pane>
            {leftItems.map((item) => (
              <Item
                isSelected={item.isSelected}
                onClick={() => {
                  setSelectedLeftMode(item.mode)
                  setSelectedRightMode(null)
                }}
              >
                <ControlName mode={item.mode} />
              </Item>
            ))}
          </Pane>
          <CenterPane>
            <InsertButton onClick={onClickAdd}>
              <ChevronDoubleLeftIcon style={{ width: "1.25rem" }} /> Add
            </InsertButton>
            <InsertButton onClick={onClickRemove}>
              Remove <ChevronDoubleRightIcon style={{ width: "1.25rem" }} />
            </InsertButton>
          </CenterPane>
          <Pane>
            {rightItems.map((item) => (
              <Item
                isSelected={item.isSelected}
                onClick={() => {
                  setSelectedLeftMode(null)
                  setSelectedRightMode(item.mode)
                }}
              >
                <ControlName mode={item.mode} />
              </Item>
            ))}
          </Pane>
        </Content>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})
