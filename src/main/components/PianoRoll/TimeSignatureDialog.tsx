import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
} from "@material-ui/core"
import { range } from "lodash"
import { useEffect, useState, VFC } from "react"
import styled from "styled-components"

export interface TimeSignatureDialogProps {
  open: boolean
  onClose: () => void
  onClickOK: (timeSignature: { numerator: number; denominator: number }) => void
}

const NumberInput = styled.input`
  background: transparent;
  -webkit-appearance: none;
  border: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 3em;
  text-align: center;
  outline: none;
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  padding: 0.2rem 0;
  border: 1px solid var(--divider-color);
  border-radius: 0.2rem;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const TimeSignatureDialog: VFC<TimeSignatureDialogProps> = ({
  open,
  onClose,
  onClickOK,
}) => {
  const [numerator, setNumerator] = useState(4)
  const [denominator, setDenominator] = useState(4)

  useEffect(() => {
    // reset values when opening the dialog
    if (open) {
      setNumerator(4)
      setDenominator(4)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Time Signature</DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NumberInput
            value={numerator}
            type="number"
            min={1}
            max={32}
            onChange={(e) => setNumerator(parseInt(e.target.value))}
            onBlur={() => setNumerator(Math.max(1, Math.min(32, numerator)))}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          />
          <span
            style={{
              width: "3em",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            /
          </span>
          <Select
            style={{
              width: "4em",
            }}
            value={denominator.toString()}
            onChange={(e) => setDenominator(parseInt(e.target.value as string))}
          >
            {range(0, 6)
              .map((v) => Math.pow(2, v))
              .map((v) => (
                <MenuItem value={v.toString()}>{v}</MenuItem>
              ))}
          </Select>
        </div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onClickOK({ numerator, denominator })
            onClose()
          }}
          disabled={isNaN(numerator) && numerator <= 32 && numerator > 0}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
