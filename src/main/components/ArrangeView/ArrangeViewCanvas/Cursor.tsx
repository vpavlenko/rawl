import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { Rectangles } from "../../GLSurface/shapes/Rectangles"

export const Cursor: VFC<{ x: number; height: number }> = ({ x, height }) => {
  const color = vec4.fromValues(1, 0, 0, 1)

  return (
    <Rectangles
      rects={[
        {
          x,
          y: 0,
          width: 1,
          height,
        },
      ]}
      color={color}
      zIndex={10}
    />
  )
}
