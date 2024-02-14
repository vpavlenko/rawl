import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import { DrumNoteShader } from "./shaders/DrumNoteShader"
import { INoteData, NoteBuffer } from "./shaders/NoteShader"

export interface NoteCirclesProps {
  rects: (IRect & INoteData)[]
  strokeColor: vec4
  inactiveColor: vec4
  activeColor: vec4
  selectedColor: vec4
  zIndex?: number
}

export const NoteCircles: FC<NoteCirclesProps> = ({
  rects,
  strokeColor,
  selectedColor,
  inactiveColor,
  activeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={DrumNoteShader}
      createBuffer={(gl) => new NoteBuffer(gl)}
      uniforms={{
        projectionMatrix,
        strokeColor,
        selectedColor,
        inactiveColor,
        activeColor,
      }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
