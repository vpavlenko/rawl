export class RenderProperty<T> {
  private _isDirty: boolean
  private _value: T
  private isEqual: (a: T, b: T) => boolean

  constructor(value: T, isEqual: (a: T, b: T) => boolean = (a, b) => a === b) {
    this._value = value
    this._isDirty = true
    this.isEqual = isEqual
  }

  get isDirty() {
    return this._isDirty
  }

  set value(value: T) {
    if (!this.isEqual(this._value, value)) {
      this._isDirty = true
      this._value = value
    }
  }

  get value() {
    return this._value
  }
}
