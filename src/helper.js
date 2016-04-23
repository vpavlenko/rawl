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
  getMethodNames(obj).forEach(name => {
    obj[name] = obj[name].bind(obj)
  })
}

const timers = {}

function beginPerformanceTimer(name) {
  timers[name] = new Date
}

function stopPerformanceTimer(name) {
  const now = new Date
  const date = timers[name]
  console.log(`${name}: ${now - date} millisec`)
}

function measurePerformance(name, tag) {
  tag.on("update", () => {
    beginPerformanceTimer(name)
  })
  tag.on("updated", () => {
    stopPerformanceTimer(name)
  })
  tag.on("before-mount", () => {
    beginPerformanceTimer(name+" mount")
  })
  tag.on("mount", () => {
    stopPerformanceTimer(name+ "mount")
  })
  tag.on('before-unmount', function() {
    beginPerformanceTimer(name+" unmount")
  })
  tag.on('unmount', function() {
    stopPerformanceTimer(name+ "unmount")
  })
}
