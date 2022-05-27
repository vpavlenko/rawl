import useComponentSize from "@rehooks/component-size"
import { mat4 } from "gl-matrix"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Renderer2D } from "../../gl/Renderer2D"
import { ProjectionMatrixContext } from "../../hooks/useProjectionMatrix"
import { RendererContext } from "../../hooks/useRenderer"

export type GLSurfaceProps = Omit<
  React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
  "ref"
> & {
  width: number
  height: number
  onCreateContext: (gl: WebGLRenderingContext) => void
}

export const GLSurface = forwardRef<HTMLCanvasElement, GLSurfaceProps>(
  ({ width, height, onCreateContext, style, children, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useImperativeHandle(ref, () => canvasRef.current!)
    const [renderer, setRenderer] = useState<Renderer2D | null>(null)
    const size = useComponentSize(canvasRef)

    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas === null) {
        throw new Error("canvas is not mounted")
      }
      // GL コンテキストを初期化する
      // Initialize GL context
      const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        desynchronized: true,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      })

      // WebGL が使用可能で動作している場合にのみ続行します
      // Continue only if WebGL is enabled
      if (gl === null) {
        alert("WebGL can't be initialized. May be browser doesn't support")
        return
      }

      const renderer = new Renderer2D(gl)
      setRenderer(renderer)

      onCreateContext(gl)

      return () => {
        gl?.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }, [])

    const projectionMatrix = useMemo(
      () => renderer?.createProjectionMatrix() ?? mat4.create(),
      [renderer, size.width, size.height]
    )

    const canvasScale = window.devicePixelRatio

    return (
      <>
        <canvas
          {...props}
          ref={canvasRef}
          width={width * canvasScale}
          height={height * canvasScale}
          style={{
            ...style,
            width: width,
            height: height,
          }}
        />
        {renderer && (
          <RendererContext.Provider value={renderer}>
            <ProjectionMatrixContext.Provider value={projectionMatrix}>
              {children}
            </ProjectionMatrixContext.Provider>
          </RendererContext.Provider>
        )}
      </>
    )
  }
)
