import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import { DrumNoteShader } from "./shaders/DrumNoteShader"
import { IColorData, NoteBuffer } from "./shaders/NoteShader"

export interface NoteCirclesProps {
  rects: (IRect & IColorData)[]
  strokeColor: vec4
  zIndex?: number
}

export const NoteCircles: FC<NoteCirclesProps> = ({
  rects,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={DrumNoteShader}
      createBuffer={(gl) => new NoteBuffer(gl)}
      uniforms={{ projectionMatrix, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
