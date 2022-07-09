import { makeObservable, observable } from "mobx"

export interface DialogOptions<Keys extends string> {
  title: string
  message?: string
  actions: DialogAction<Keys>[]
}

export interface DialogAction<Key extends string> {
  title: string
  key: Key
}

type DialogProps<Keys extends string> = DialogOptions<Keys> & {
  callback: (key: Keys) => void
}

export class DialogStore {
  props: DialogProps<any> | null = null

  constructor() {
    makeObservable(this, {
      props: observable,
    })
  }

  async show<Keys extends string>(options: DialogOptions<Keys>): Promise<Keys> {
    return new Promise((resolve, _reject) => {
      this.props = {
        ...options,
        callback: (key) => resolve(key),
      }
    })
  }
}
