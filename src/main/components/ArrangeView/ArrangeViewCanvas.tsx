import { mat4, vec3, vec4 } from "gl-matrix"
import { useCallback, useMemo, useState, VFC } from "react"
import { IRect } from "../../../common/geometry"
import { SolidRectangleObject2 } from "../../gl/shaders/SolidRectangleShader"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLSolidRectangleNode } from "../GLSurface/GLSolidRectangleNode"
import { GLSurface } from "../GLSurface/GLSurface"

export interface ArrangeViewCanvasProps {
  width: number
}

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = ({ width }) => {
  const rootStore = useStores()
  const theme = useTheme()

  const tracks = rootStore.song.tracks

  const {
    notes,
    cursorX,
    selectionRect,
    trackHeight,
    scrollLeft,
    scrollTop,
    rulerStore: { beats },
  } = rootStore.arrangeViewStore

  const [gl, setGL] = useState<WebGLRenderingContext | null>(null)
  const [noteObject, setNoteObject] = useState<SolidRectangleObject2 | null>(
    null
  )
  const [lineObject, setLineObject] = useState<SolidRectangleObject2 | null>(
    null
  )

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: gl?.canvas.height ?? 0,
  })

  const hline = (y: number): IRect => ({
    x: 0,
    y,
    width: gl?.canvas.width ?? 0,
    height: 1,
  })

  const lineBuffer = useMemo(
    () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
    [lineObject, tracks, gl?.canvas.width]
  )

  const onCreateContext = useCallback((gl: WebGLRenderingContext) => {
    setGL(gl)
  }, [])

  const createProjectionMatrix = () => {
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
  }

  const height = trackHeight * tracks.length

  return (
    <GLSurface
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    >
      <GLSolidRectangleNode
        buffer={lineBuffer}
        uniforms={{
          projectionMatrix: createProjectionMatrix(),
          color: vec4.fromValues(1, 0, 0, 1),
        }}
      />
    </GLSurface>
  )
}
