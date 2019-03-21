import { controlChangeEvents } from "midi/MidiEvent"
import { ControllerEvent, AnyEvent } from "@signal-app/midifile-ts"
import Track, { TrackEventRequired, TrackEvent, RPNEvent } from "../track"

/**

RPN コントローラーイベントをひとつのイベントオブジェクトとしてまとめる

RPN は種類、値を表す2～4つのイベントからなるが、
バラバラになると正しく動作しないので、
読み込み時にひとつにまとめ、再生・保存時に元に戻す

*/
export function assemble(events: any[]) {
  const result: TrackEvent[] = []

  // ひとつにまとめた RPN イベントを作成する
  function createCC(
    rpnMSB: TrackEventRequired & ControllerEvent,
    rpnLSB: ControllerEvent,
    dataMSB?: ControllerEvent,
    dataLSB?: ControllerEvent
  ): RPNEvent {
    return {
      id: -1,
      channel: rpnMSB.channel,
      type: "channel",
      subtype: "rpn",
      tick: rpnMSB.tick,
      deltaTime: rpnMSB.deltaTime,
      rpnMSB: rpnMSB.value,
      rpnLSB: rpnLSB.value,
      dataMSB: dataMSB ? dataMSB.value : undefined,
      dataLSB: dataLSB ? dataLSB.value : undefined
    }
  }

  function isCC(e: AnyEvent, type: number): e is ControllerEvent {
    return (
      e &&
      (e as ControllerEvent).subtype === "controller" &&
      (e as ControllerEvent).controllerType === type
    )
  }
  function isRPNMSB(e: AnyEvent): e is ControllerEvent & TrackEventRequired {
    return isCC(e, 101)
  }
  function isRPNLSB(e: AnyEvent): e is ControllerEvent & TrackEventRequired {
    return isCC(e, 100)
  }
  function isDataMSB(e: AnyEvent): e is ControllerEvent & TrackEventRequired {
    return isCC(e, 6)
  }
  function isDataLSB(e: AnyEvent): e is ControllerEvent & TrackEventRequired {
    return isCC(e, 38)
  }

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (isRPNMSB(e)) {
      const j = i
      const getNextIf = (event: AnyEvent, test: (e: AnyEvent) => boolean) => {
        if (test(event)) {
          i++ // skip this event
          return event
        }
        return null
      }
      result.push(
        createCC(
          e as (TrackEventRequired & ControllerEvent),
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
  return (e as any).subtype === "rpn"
}

export function deassemble(e: TrackEvent): TrackEvent[] {
  if (isRPNEvent(e)) {
    return controlChangeEvents(
      e.deltaTime,
      e.rpnMSB,
      e.rpnLSB,
      e.dataMSB,
      e.dataLSB
    ).map(c => ({
      ...c,
      id: e.id,
      channel: e.channel,
      tick: e.tick
    }))
  }
  return [e]
}
