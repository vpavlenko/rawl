function extend(target, source) {
    return Object.assign({}, target, source)
}

function getMethodNames(obj) {
  var names = []
  var isFirst = false
  for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
    let method = obj[name]
    if (!(method instanceof Function)) continue
    names.push(name)
  }
  // remove constructer that is in head of array
  var [_, ...result] = names
  return result
}

/// bind all methods to this
function bindAllMethods(obj) {
  getMethodNames(obj).forEach((name) => {
    obj[name] = obj[name].bind(obj)
  })
}
