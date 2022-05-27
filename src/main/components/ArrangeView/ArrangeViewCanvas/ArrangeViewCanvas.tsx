import useComponentSize from "@rehooks/component-size"
import { mat4, vec3 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { useCallback, useMemo, useRef, useState, VFC } from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import { Beats } from "./Beats"
import { Cursor } from "./Cursor"
import { Lines } from "./Lines"
import { Notes } from "./Notes"
import { Selection } from "./Selection"

export interface ArrangeViewCanvasProps {
  width: number
}

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = observer(
  ({ width }) => {
    const rootStore = useStores()
    const tracks = rootStore.song.tracks
    const { trackHeight, scrollLeft, scrollTop } = rootStore.arrangeViewStore
    const ref = useRef<HTMLCanvasElement>(null)
    const size = useComponentSize(ref)

    const [gl, setGL] = useState<WebGLRenderingContext | null>(null)

    const onCreateContext = useCallback((gl: WebGLRenderingContext) => {
      setGL(gl)
    }, [])

    const projectionMatrix = useMemo(() => {
      if (gl === null) {
        return mat4.create()
      }
      const zNear = 0
      const zFar = 100.0
      const projectionMatrix = mat4.create()

      const canvas = gl.canvas as HTMLCanvasElement

      const scale = canvas.clientWidth / canvas.width
      mat4.scale(
        projectionMatrix,
        projectionMatrix,
        vec3.fromValues(scale, scale, scale)
      )

      mat4.ortho(
        projectionMatrix,
        0,
        canvas.clientWidth,
        canvas.clientHeight,
        0,
        zNear,
        zFar
      )

      return projectionMatrix
    }, [gl, size.width, size.height])

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    )

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop]
    )

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop]
    )

    const height = trackHeight * tracks.length

    return (
      <GLSurface
        ref={ref}
        style={{ pointerEvents: "none" }}
        onCreateContext={onCreateContext}
        width={width}
        height={height}
      >
        <Transform matrix={scrollYMatrix}>
          <Lines width={width} />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <Beats height={height} />
        </Transform>
        <Transform matrix={scrollXYMatrix}>
          <Notes />
          <Selection />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <Cursor height={height} />
        </Transform>
      </GLSurface>
    )
  }
)
