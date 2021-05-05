import { initShaderProgram } from "../helpers/webgl"
import { Attrib } from "./Attrib"
import { Uniform } from "./Uniform"

type GetUniformType<C extends Uniform<any>> = C extends Uniform<infer T>
  ? T
  : unknown

export interface ShaderBuffer<B extends Record<string, WebGLBuffer>> {
  vertexCount: number
  buffers: B
}

export class Shader<
  A extends Record<string, Attrib>,
  U extends Record<string, Uniform<any>>
> {
  private gl: WebGLRenderingContext
  private program: WebGLProgram

  readonly attributes: A
  readonly uniforms: U

  constructor(
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string,
    attributes: (program: WebGLProgram) => A,
    uniforms: (program: WebGLProgram) => U
  ) {
    this.gl = gl
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.attributes = attributes(program)
    this.uniforms = uniforms(program)
  }

  setUniforms(
    props: {
      [Property in keyof U]: GetUniformType<U[Property]>
    }
  ) {
    for (let key in props) {
      this.uniforms[key as keyof U].value = props[key as keyof typeof props]
    }
  }

  draw(buffer: ShaderBuffer<{ [Property in keyof A]: WebGLBuffer }>) {
    if (buffer.vertexCount === 0) {
      return
    }

    const { gl } = this

    Object.keys(this.attributes).forEach((k) =>
      this.attributes[k as keyof A].upload(buffer.buffers[k as keyof A])
    )

    gl.useProgram(this.program)

    Object.values(this.uniforms).forEach((u) => u.upload(gl))

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
