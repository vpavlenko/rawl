import useComponentSize from "@rehooks/component-size"
import { mat4, vec3 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { useCallback, useMemo, useRef, useState, VFC } from "react"
import { translateMatrix } from "../../../gl/Renderer2D"
import { useStores } from "../../../hooks/useStores"
import { GLSurface } from "../../GLSurface/GLSurface"
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
      () => translateMatrix(projectionMatrix, -scrollLeft, 0),
      [projectionMatrix, scrollLeft]
    )

    const scrollYMatrix = useMemo(
      () => translateMatrix(projectionMatrix, 0, -scrollTop),
      [projectionMatrix, scrollLeft, scrollTop]
    )

    const scrollXYMatrix = useMemo(
      () => translateMatrix(projectionMatrix, -scrollLeft, -scrollTop),
      [projectionMatrix, scrollLeft, scrollTop]
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
        <Lines width={width} projectionMatrix={scrollYMatrix} />
        <Beats height={height} projectionMatrix={scrollXMatrix} />
        <Notes projectionMatrix={scrollXYMatrix} />
        <Selection projectionMatrix={scrollXYMatrix} />
        <Cursor height={height} projectionMatrix={scrollXMatrix} />
      </GLSurface>
    )
  }
)
