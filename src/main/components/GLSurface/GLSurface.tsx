import { isArray } from "lodash"
import { Component, FC, useEffect, useRef, useState } from "react"
import { Renderable, Renderer2D } from "../../gl/Renderer2D"
import { Shader } from "../../gl/Shader"

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

interface Buffer<T> {
  update(props: T): void
}

export abstract class GLNode<Props>
  extends Component<{ buffer: Props }>
  implements Renderable
{
  renderer: Renderer2D | null = null
  private isInitialized = false
  protected shader: Shader<any, any> | null = null
  protected buffer: Buffer<Props> | null = null

  constructor(props: { buffer: Props }) {
    super(props)
  }

  componentDidUpdate() {
    this.buffer?.update(this.props.buffer)
    this.renderer?.setNeedsDisplay()
  }

  abstract initialize(gl: WebGLRenderingContext): void

  setContext(gl: WebGLRenderingContext) {
    if (this.isInitialized) {
      return
    }
    this.initialize(gl)
    this.isInitialized = true
  }

  draw(): void {
    this.shader?.draw(this.buffer as any)
  }
}

export const isGLNode = (x: any): x is GLNode<any> => x instanceof GLNode

export const GLSurface: FC<GLSurfaceProps> = ({
  width,
  height,
  onCreateContext,
  style,
  children,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<Renderer2D | null>(null)

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

  useEffect(() => {
    if (!isArray(children)) {
      return
    }
    const nodes = children?.filter(isGLNode) ?? []
    renderer?.setObjects(nodes)
    if (renderer !== null) {
      nodes.forEach((c) => {
        c.initialize(renderer.gl)
        c.renderer = renderer
      })
    }
  }, [renderer, children])

  const canvasScale = window.devicePixelRatio

  return (
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
  )
}
