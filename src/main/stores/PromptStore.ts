import { makeObservable, observable } from "mobx"

export interface PromptOptions {
  title: string
  message?: string
  initialText?: string
}

type PromptProps = PromptOptions & {
  callback: (text: string | null) => void
}

export class PromptStore {
  props: PromptProps | null = null

  constructor() {
    makeObservable(this, {
      props: observable,
    })
  }

  async show(options: PromptOptions): Promise<string | null> {
    return new Promise((resolve, _reject) => {
      this.props = {
        ...options,
        callback: (text) => resolve(text),
      }
    })
  }
}
