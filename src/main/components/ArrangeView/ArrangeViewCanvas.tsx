import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { useCallback, useMemo, useState, VFC } from "react"
import { IRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLSurface } from "../GLSurface/GLSurface"
import { Rectangles } from "../GLSurface/Rectangles"

export interface ArrangeViewCanvasProps {
  width: number
}

const Lines: VFC<{ width: number; projectionMatrix: mat4 }> = ({
  width,
  projectionMatrix,
}) => {
  const rootStore = useStores()
  const theme = useTheme()

  const { trackHeight } = rootStore.arrangeViewStore

  const tracks = rootStore.song.tracks

  const hline = (y: number): IRect => ({
    x: 0,
    y,
    width,
    height: 1,
  })

  const rects = useMemo(
    () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
    [tracks, width]
  )

  const color = colorToVec4(Color(theme.dividerColor))

  return (
    <Rectangles
      rects={rects}
      projectionMatrix={projectionMatrix}
      color={color}
    />
  )
}

const Cursor: VFC<{ projectionMatrix: mat4; height: number }> = ({
  projectionMatrix,
  height,
}) => {
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

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = ({ width }) => {
  const rootStore = useStores()
  const tracks = rootStore.song.tracks
  const { trackHeight } = rootStore.arrangeViewStore

  const [gl, setGL] = useState<WebGLRenderingContext | null>(null)

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
  const projectionMatrix = createProjectionMatrix()

  return (
    <GLSurface
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    >
      <Lines
        width={gl?.canvas.width ?? 0}
        projectionMatrix={projectionMatrix}
      />
      <Cursor
        height={gl?.canvas.height ?? 0}
        projectionMatrix={projectionMatrix}
      />
    </GLSurface>
  )
}
