import { Component } from "react"
import { Shader } from "../../gl/DisplayObject"
import { Renderable } from "../../gl/Renderer2D"
import { RendererContext } from "../../hooks/useRenderer"

interface Buffer<T> {
  update(props: T): void
}

interface GLNodeProps {
  createShader: (gl: WebGLRenderingContext) => Shader<any, any>
  createBuffer: (gl: WebGLRenderingContext) => Buffer<any>
  buffer: any
  uniforms: any
  zIndex?: number
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
    this.buffer.update(this.props.buffer)
    this.context.addObject(this)
    this.context.setNeedsDisplay()
  }

  componentWillUnmount() {
    this.context.removeObject(this)
  }

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

  get zIndex(): number {
    return this.props.zIndex ?? 0
  }
}
