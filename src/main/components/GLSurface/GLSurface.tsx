import { Component, FC, useEffect, useRef, useState } from "react"
import { Renderable, Renderer2D } from "../../gl/Renderer2D"
import { Shader } from "../../gl/Shader"
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

interface Buffer<T> {
  update(props: T): void
}

interface GLNodeProps {
  createShader: (gl: WebGLRenderingContext) => Shader<any, any>
  createBuffer: (gl: WebGLRenderingContext) => Buffer<any>
  buffer: any
  uniforms: any
}

export abstract class GLNode
  extends Component<GLNodeProps>
  implements Renderable
{
  protected shader: Shader<any, any> | null = null
  protected buffer: Buffer<ReturnType<GLNodeProps["createBuffer"]>> | null =
    null
  protected uniforms: any = {}

  constructor(props: GLNodeProps) {
    super(props)
  }

  static contextType = RendererContext
  declare context: React.ContextType<typeof RendererContext>

  componentDidUpdate() {
    this.buffer?.update(this.props.buffer)
    this.context.setNeedsDisplay()
  }

  componentDidMount() {
    if (this.context === null) {
      throw new Error("Must provide RendererContext")
    }
    const gl = this.context.gl
    this.shader = this.props.createShader(gl)
    this.buffer = this.props.createBuffer(gl)
    this.context.addObject(this)
  }

  componentWillUnmount() {
    this.context.removeObject(this)
  }

  protected abstract initialize(gl: WebGLRenderingContext): void

  draw(): void {
    if (this.shader === null || this.buffer === null) {
      return
    }
    this.shader.setUniforms(this.props.uniforms)
    this.shader.draw(this.buffer as any)
  }

  render() {
    return <></>
  }
}

export const isGLNode = (x: any): x is GLNode => x instanceof GLNode

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
          {children}
        </RendererContext.Provider>
      )}
    </>
  )
}
