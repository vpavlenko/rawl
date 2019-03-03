import _ from "lodash"

/// serializr の schema. 値が type もしくは type の配列であることを要求する
export default function orArrayOf(base) {
  return {
    serializer: value => {
      if (!_.isString(value) && _.isArrayLike(value)) {
        return {
          type: "Array",
          value: value.map(base.serializer) // 配列の要素が type かチェックする
        }
      }
      return base.serializer(value)
    },
    deserializer: (jsonValue, done) => {
      if (_.isObject(jsonValue) && jsonValue.type === "Array") {
        return void asyncMap(jsonValue.value, base.deserializer, done)
      }
      return base.deserializer(jsonValue, done)
    }
  }
}

function asyncMap(arr, func, done, result = [], index = 0) {
  if (index >= arr.length) {
    return void done(null, result)
  }
  func(arr[index], (_, value) => {
    result.push(value)
    index++
    asyncMap(arr, func, done, result, index)
  })
}
