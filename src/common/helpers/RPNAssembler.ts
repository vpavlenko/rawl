import { controlChangeEvents } from "midi/MidiEvent"
import { ControllerEvent, AnyEvent, Event } from "@signal-app/midifile-ts"

export interface RPNEvent {
  channel: number
  type: "channel"
  subtype: "rpn"
  tick: number
  deltaTime: number
  rpnMSB: number
  rpnLSB: number
  dataMSB: number|undefined
  dataLSB: number|undefined
}

/**

RPN コントローラーイベントをひとつのイベントオブジェクトとしてまとめる

RPN は種類、値を表す2～4つのイベントからなるが、
バラバラになると正しく動作しないので、
読み込み時にひとつにまとめ、再生・保存時に元に戻す

*/
export function assemble(events: AnyEvent[]) {
  const result = []

  // ひとつにまとめた RPN イベントを作成する
  function createCC(rpnMSB, rpnLSB, dataMSB?, dataLSB?): RPNEvent {
    return {
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
    return e 
      && (e as ControllerEvent).subtype === "controller" 
      && (e as ControllerEvent).controllerType === type 
    }
  function isRPNMSB(e): e is ControllerEvent { return isCC(e, 101) }
  function isRPNLSB(e): e is ControllerEvent { return isCC(e, 100) }
  function isDataMSB(e): e is ControllerEvent { return isCC(e, 6) }
  function isDataLSB(e): e is ControllerEvent { return isCC(e, 38) }

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (isRPNMSB(e)) {
      const j = i
      const data: ControllerEvent[] = [e]
      const getNextIf = (event, test) => {
        if (test(event)) {
          i++ // skip this event
          return event
        }
        return null
      }
      result.push(createCC(
        e, 
        getNextIf(events[j + 1], isRPNLSB), 
        getNextIf(events[j + 2], isDataMSB), 
        getNextIf(events[j + 3], isDataLSB)
      ))
    } else {
      result.push(e)
    }
  }
  return result
}

function isRPNEvent(e: AnyEvent): e is RPNEvent {
  return (e as any).subtype === "rpn"
}

export function deassemble(e: AnyEvent): AnyEvent[] {
  if (isRPNEvent(e)) {
    return controlChangeEvents(e.deltaTime, e.rpnMSB, e.rpnLSB, e.dataMSB, e.dataLSB).map(c => ({
      ...c,
      channel: e.channel,
      tick: e.tick
    }))
  }
  return [e]
}
