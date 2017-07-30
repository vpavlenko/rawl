/**

RPN コントローラーイベントをひとつのイベントオブジェクトとしてまとめる

RPN は種類、値を表す2～4つのイベントからなるが、
バラバラになると正しく動作しないので、
読み込み時にひとつにまとめ、再生・保存時に元に戻す

*/
export function assemble(events) {
  let rpnMSB, rpnLSB, dataMSB, dataLSB
  const result = []

  // 現在の RPN の種類を確かめる
  function test(m, l) {
    if (!rpnMSB || !rpnLSB) {
      console.log("RPN indicator is not specified")
      return false
    }
    return rpnMSB.value === m && rpnLSB.value === l
  }

  // ひとつにまとめた RPN イベントを作成し、状態をリセットする
  function createRPN(type) {
    result.push({
      channel: rpnMSB.channel,
      type: "channel",
      subtype: "RPN",
      rpnType: type,
      tick: rpnMSB.tick,
      rpnMSBValue: rpnMSB.value,
      rpnLSBValue: rpnLSB.value,
      dataMSBValue: dataMSB && dataMSB.value,
      dataLSBValue: dataLSB && dataLSB.value
    })
    rpnMSB = rpnLSB = dataMSB = dataLSB = undefined
  }

  for (let e of events) {
    if (e.subtype !== "controller") {
      result.push(e)
      continue
    }
    switch(e.controllerType) {
      case 101: // RPN MSB
      rpnMSB = e
      break
      case 100: // RPN LSB
      rpnLSB = e
      if (test(127, 127)) {
        createRPN("null")
      }
      break
      case 6: // Data MSB
      dataMSB = e
      if (test(0, 0)) {
        createRPN("pitchbend sensitivity")
      } else if (test(0, 2)) {
        createRPN("master coarse tuning")
      }
      break
      case 38: // Data LSB
      dataLSB = e
      if (test(0, 1)) {
        createRPN("master fine sensitivity")
      }
      break
      default:
      result.push(e)
    }
  }
  return result
}

export function deassemble(events) {
  // TODO: 実装
}
