import { ControlChangeEvents } from "midi/MidiEvent"

/**

RPN コントローラーイベントをひとつのイベントオブジェクトとしてまとめる

RPN は種類、値を表す2～4つのイベントからなるが、
バラバラになると正しく動作しないので、
読み込み時にひとつにまとめ、再生・保存時に元に戻す

*/
export function assemble(events) {
  const result = []

  // ひとつにまとめた RPN イベントを作成する
  function createCC(rpnMSB, rpnLSB, dataMSB, dataLSB) {
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

  function isCC(e, type) { return e && e.subtype === "controller" && e.controllerType === type }
  function isRPNMSB(e) { return isCC(e, 101) }
  function isRPNLSB(e) { return isCC(e, 100) }
  function isDataMSB(e) { return isCC(e, 6) }
  function isDataLSB(e) { return isCC(e, 38) }

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (isRPNMSB(e)) {
      const j = i
      const data = [e]
      function add(event, test) {
        if (test(event)) {
          data.push(event)
          i++ // skip this event
        }
      }
      add(events[j + 1], isRPNLSB)
      add(events[j + 2], isDataMSB)
      add(events[j + 3], isDataLSB)
      result.push(createCC(...data))
    } else {
      result.push(e)
    }
  }
  return result
}

export function deassemble(e) {
  if (e.subtype === "rpn") {
    return ControlChangeEvents(e.deltaTime, e.rpnMSB, e.rpnLSB, e.dataMSB, e.dataLSB).map(c => ({
      ...c,
      channel: e.channel,
      tick: e.tick
    }))
  }
  return [e]
}
