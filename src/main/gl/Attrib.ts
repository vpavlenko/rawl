export class Attrib {
  private gl: WebGLRenderingContext
  private position: number
  private size: number
  private type: number

  constructor(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    size: number,
    type: number = gl.FLOAT
  ) {
    this.gl = gl
    this.position = gl.getAttribLocation(program, name)
    if (this.position < 0) {
      throw new Error(`failed to getAttribLocation ${name}`)
    }
    this.size = size
    this.type = type
  }

  upload(buffer: WebGLBuffer) {
    const { gl } = this
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(this.position, this.size, this.type, false, 0, 0)
    gl.enableVertexAttribArray(this.position)
  }
}
