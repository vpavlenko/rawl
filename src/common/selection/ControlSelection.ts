export interface ControlSelection {
  fromTick: number
  toTick: number
}

export const emptyControlSelection: ControlSelection = {
  fromTick: 0,
  toTick: 0,
}
