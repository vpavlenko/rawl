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
  onSelect: (color: string | null) => void
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
  const _onSelect = (color: string | null) => {
    onSelect(color)
    onClose()
  }

  const hues = [-5, 25, 45, 155, 190, 230, 260, 335]
  const saturation = 70
  const luminances = [65, 55, 39]

  const colors = range(0, luminances.length).flatMap((y) =>
    range(0, hues.length).map(
      (x) =>
        `hsl(
          ${hues[x].toFixed()}deg
          ${saturation}%
          ${luminances[y].toFixed()}%
        )`,
    ),
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
        <Button onClick={() => _onSelect(null)}>
          <Localized default="Reset">reset</Localized>
        </Button>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
