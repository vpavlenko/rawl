import { mat4, vec4 } from "gl-matrix"
import { RenderProperty } from "./RenderProperty"

type UploadFunc<T> = (
  gl: WebGLRenderingContext,
  location: WebGLUniformLocation,
  value: T
) => void

export class Uniform<T> {
  private location: WebGLUniformLocation
  private prop: RenderProperty<T>
  private uploadFunc: UploadFunc<T>

  constructor(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    initialValue: RenderProperty<T>,
    fn: UploadFunc<T>
  ) {
    this.location = gl.getUniformLocation(program, name)!
    this.prop = initialValue
    this.uploadFunc = fn
  }

  set value(value: T) {
    this.prop.value = value
  }

  upload(gl: WebGLRenderingContext) {
    if (this.prop.isDirty) {
      this.uploadFunc(gl, this.location, this.prop.value)
      this.prop.mark()
    }
  }
}

export const uniformMat4 = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  initialValue: mat4 = mat4.create()
) =>
  new Uniform<mat4>(
    gl,
    program,
    name,
    new RenderProperty<mat4>(initialValue, mat4.equals),
    (gl, location, value) => gl.uniformMatrix4fv(location, false, value)
  )

export const uniformVec4 = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  initialValue: vec4 = vec4.create()
) =>
  new Uniform<vec4>(
    gl,
    program,
    name,
    new RenderProperty<vec4>(initialValue, vec4.equals),
    (gl, location, value) => gl.uniform4fv(location, value)
  )

export const uniformFloat = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  initialValue: number = 0
) =>
  new Uniform<number>(
    gl,
    program,
    name,
    new RenderProperty<number>(initialValue),
    (gl, location, value) => gl.uniform1f(location, value)
  )
