import { PixiComponent } from "@inlet/react-pixi"
import { Graphics } from "pixi.js"

export interface RectangleProps {
  fill: number
  x: number
  y: number
  width: number
  height: number
}

export const Rectangle = PixiComponent<RectangleProps, Graphics>("Rectangle", {
  create: (props) => {
    return new Graphics()
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height } = newProps
    instance.clear().beginFill(fill).drawRect(x, y, width, height).endFill()
  },
})
