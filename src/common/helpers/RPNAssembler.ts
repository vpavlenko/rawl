import { controlChangeEvents } from "midi/MidiEvent"
import { ControllerEvent, AnyEvent, ChannelEvent } from "midifile-ts"

export interface RPNEvent extends ChannelEvent<"rpn"> {
  rpnMSB: number
  rpnLSB: number
  dataMSB: number | undefined
  dataLSB: number | undefined
}

/**

RPN コントローラーイベントをひとつのイベントオブジェクトとしてまとめる

RPN は種類、値を表す2～4つのイベントからなるが、
バラバラになると正しく動作しないので、
読み込み時にひとつにまとめ、再生・保存時に元に戻す

*/
export function assemble<T>(events: (T | ControllerEvent)[]): (T | RPNEvent)[] {
  const result: (T | RPNEvent)[] = []

  // ひとつにまとめた RPN イベントを作成する
  function createCC(
    rpnMSB: ControllerEvent,
    rpnLSB: ControllerEvent,
    dataMSB?: ControllerEvent,
    dataLSB?: ControllerEvent
  ): RPNEvent {
    return {
      channel: rpnMSB.channel,
      type: "channel",
      subtype: "rpn",
      deltaTime: rpnMSB.deltaTime,
      rpnMSB: rpnMSB.value,
      rpnLSB: rpnLSB.value,
      dataMSB: dataMSB ? dataMSB.value : undefined,
      dataLSB: dataLSB ? dataLSB.value : undefined
    }
  }

  function isCC(e: T | ControllerEvent, type: number): e is ControllerEvent {
    return (
      e &&
      "subtype" in e &&
      e.subtype === "controller" &&
      "controllerType" in e &&
      e.controllerType === type
    )
  }
  function isRPNMSB(e: T | ControllerEvent): e is ControllerEvent {
    return isCC(e, 101)
  }
  function isRPNLSB(e: T | ControllerEvent): e is ControllerEvent {
    return isCC(e, 100)
  }
  function isDataMSB(e: T | ControllerEvent): e is ControllerEvent {
    return isCC(e, 6)
  }
  function isDataLSB(e: T | ControllerEvent): e is ControllerEvent {
    return isCC(e, 38)
  }

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (isRPNMSB(e)) {
      const j = i
      const getNextIf = (
        event: T | ControllerEvent,
        test: (e: T | ControllerEvent) => boolean
      ) => {
        if (test(event)) {
          i++ // skip this event
          return event
        }
        return null
      }
      result.push(
        createCC(
          e as ControllerEvent,
          getNextIf(events[j + 1], isRPNLSB) as ControllerEvent,
          getNextIf(events[j + 2], isDataMSB) as ControllerEvent,
          getNextIf(events[j + 3], isDataLSB) as ControllerEvent
        )
      )
    } else {
      result.push(e)
    }
  }
  return result
}

function isRPNEvent(e: any): e is RPNEvent {
  return "subtype" in e && e.subtype === "rpn"
}

export function deassemble<T, S extends ControllerEvent>(
  e: T | RPNEvent,
  map: (e: ControllerEvent) => S
): (T | S)[] {
  if (isRPNEvent(e)) {
    return controlChangeEvents(
      e.deltaTime,
      e.channel,
      e.rpnMSB,
      e.rpnLSB,
      e.dataMSB,
      e.dataLSB
    ).map(map)
  }
  return [e]
}
