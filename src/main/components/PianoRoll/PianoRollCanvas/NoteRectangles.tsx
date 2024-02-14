import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import { INoteData, NoteBuffer, NoteShader } from "./shaders/NoteShader"

export interface NoteRectanglesProps {
  rects: (IRect & INoteData)[]
  strokeColor: vec4
  inactiveColor: vec4
  activeColor: vec4
  selectedColor: vec4
  zIndex?: number
}

export const NoteRectangles: FC<NoteRectanglesProps> = ({
  rects,
  strokeColor,
  inactiveColor,
  activeColor,
  selectedColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={NoteShader}
      createBuffer={(vertexArray) => new NoteBuffer(vertexArray)}
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
