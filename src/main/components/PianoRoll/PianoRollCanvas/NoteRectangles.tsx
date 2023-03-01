import { GLNode, useProjectionMatrix } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import { IColorData, NoteBuffer, NoteShader } from "./shaders/NoteShader"

export interface NoteRectanglesProps {
  rects: (IRect & IColorData)[]
  strokeColor: vec4
  zIndex?: number
}

export const NoteRectangles: FC<NoteRectanglesProps> = ({
  rects,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={NoteShader}
      createBuffer={(gl) => new NoteBuffer(gl)}
      uniforms={{ projectionMatrix, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
