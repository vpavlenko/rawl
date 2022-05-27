import { mat4, vec4 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import { Rectangles } from "../../GLSurface/Rectangles"

export const Cursor: VFC<{ projectionMatrix: mat4; height: number }> = observer(
  ({ projectionMatrix, height }) => {
    const rootStore = useStores()
    const { cursorX } = rootStore.arrangeViewStore

    const vline = (x: number): IRect => ({
      x,
      y: 0,
      width: 1,
      height,
    })

    const rect = vline(cursorX)

    const color = vec4.fromValues(1, 0, 0, 1)

    return (
      <Rectangles
        rects={[rect]}
        projectionMatrix={projectionMatrix}
        color={color}
      />
    )
  }
)
