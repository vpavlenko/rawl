import Sequencer, { Output, LiveMessage, DataSource, Message } from "./index"

class TestDataSource implements DataSource<string> {
  private data: Message<string>[]

  constructor(data: Message<string>[]) {
    this.data = data
  }

  getMessages(from: number, to: number): Message<string>[] {
    return this.data.filter(msg => msg.time >= from && msg.time < to)
  }
}

describe("Sequencer", () => {
  it("onTimer", () => {
    const dataSource = new TestDataSource([
      {
        body: "hello",
        time: 5
      },
      {
        body: "world",
        time: 120
      }
    ])
    const output: Output<string> = {
      sendMessages(messages: LiveMessage<string>[], timestamp: number) {}
    }
    const s = new Sequencer(dataSource, output, 100, 50)
    s.seek(0)

    // 先読み時間分のイベントが入っている
    {
      output.sendMessages = (
        messages: LiveMessage<string>[],
        timestamp: number
      ) => {
        expect(messages).toStrictEqual([
          {
            body: "hello",
            time: 5,
            timestamp: 5
          }
        ])
      }
      s.onTimer(0)
    }

    // 前回から時間が経過してなければイベントはない
    {
      output.sendMessages = (
        messages: LiveMessage<string>[],
        timestamp: number
      ) => {
        expect(messages.length).toBe(0)
      }
      s.onTimer(0)
    }

    // 時間が経過すると2個目以降のイベントが返ってくる
    {
      output.sendMessages = (
        messages: LiveMessage<string>[],
        timestamp: number
      ) => {
        expect(messages).toStrictEqual([
          {
            body: "world",
            time: 120,
            timestamp: 120
          }
        ])
      }
      s.onTimer(100)
    }
  })
  it("seek", () => {
    const dataSource = new TestDataSource([
      {
        body: "hello",
        time: 5
      },
      {
        body: "world",
        time: 120
      }
    ])
    const output: Output<string> = {
      sendMessages(messages: LiveMessage<string>[], timestamp: number) {}
    }
    const s = new Sequencer(dataSource, output, 100, 50)
    s.seek(100)

    // seek した時点からのメッセージが送信される
    {
      output.sendMessages = (
        messages: LiveMessage<string>[],
        timestamp: number
      ) => {
        expect(messages).toStrictEqual([
          {
            body: "world",
            time: 120,
            timestamp: 20
          }
        ])
      }
      s.onTimer(0)
    }
  })
})
