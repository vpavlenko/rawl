import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import {
  HorizontalGridBuffer,
  HorizontalGridShader,
} from "./shaders/HorizontalGridShader"

export interface HorizontalGridProps {
  rect: IRect
  color: vec4
  highlightedColor: vec4
  blackLaneColor: vec4
  height: number
  zIndex?: number
}

export const HorizontalGrid: FC<HorizontalGridProps> = ({
  rect,
  color,
  highlightedColor,
  blackLaneColor,
  height,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={HorizontalGridShader}
      createBuffer={(gl) => new HorizontalGridBuffer(gl)}
      uniforms={{
        projectionMatrix,
        color,
        highlightedColor,
        blackLaneColor,
        height,
      }}
      buffer={rect}
      zIndex={zIndex}
    />
  )
}
