import styled from "@emotion/styled"
import range from "lodash/range"
import { FC } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"

const numColumn = 8

export interface ColorPickerProps {
  open: boolean
  onSelect: (color: string) => void
  onClose: () => void
}

const ColorItem = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  height: 2rem;

  &:hover {
    z-index: 2;
    box-shadow: 0 0 0 2px white;
  }
`

const Container = styled.div`
  display: grid;
  padding: 2px;
  grid-template-columns: repeat(${numColumn}, 2rem);
`

export const ColorPicker: FC<ColorPickerProps> = ({
  open,
  onSelect,
  onClose,
}) => {
  const _onSelect = (color: string) => {
    onSelect(color)
    onClose()
  }

  const colors = range(0, 4)
    .flatMap((y) =>
      range(0, numColumn).map(
        (x) =>
          `hsl(
          ${((365 / numColumn) * x).toFixed()}deg
          ${100}%
          ${((100 / 5) * (y + 1)).toFixed()}%
        )`
      )
    )
    .concat(
      range(0, numColumn).map(
        (x) => `hsl(0deg 0% ${((100 / numColumn) * x).toFixed()}%)`
      )
    )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Container>
          {colors.map((color) => (
            <ColorItem color={color} onClick={() => _onSelect(color)} />
          ))}
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
