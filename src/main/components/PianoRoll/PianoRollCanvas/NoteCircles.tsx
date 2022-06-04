import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { DrumNoteShader } from "./shaders/DrumNoteShader"
import { ISelectionData, IVelocityData, NoteBuffer } from "./shaders/NoteShader"

export interface NoteCirclesProps {
  rects: (IRect & IVelocityData & ISelectionData)[]
  fillColor: vec4
  strokeColor: vec4
  zIndex?: number
}

export const NoteCircles: VFC<NoteCirclesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={DrumNoteShader}
      createBuffer={(gl) => new NoteBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
