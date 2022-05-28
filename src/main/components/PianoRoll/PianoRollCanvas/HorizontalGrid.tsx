import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { useProjectionMatrix } from "../../../hooks/useProjectionMatrix"
import { GLNode } from "../../GLSurface/GLNode"
import {
  HorizontalGridBuffer,
  HorizontalGridShader,
} from "../PianoRollRenderer/HorizontalGridShader"

export interface HorizontalGridProps {
  rect: IRect
  color: vec4
  highlightedColor: vec4
  blackLaneColor: vec4
  height: number
  zIndex?: number
}

export const HorizontalGrid: VFC<HorizontalGridProps> = ({
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
