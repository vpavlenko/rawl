export function addTick(events) {
  let tick = 0
  for (let e of events) {
    tick += e.deltaTime
    e.tick = tick
    delete e.deltaTime
  }
  return events
}

// events in each tracks
export function addDeltaTime(events) {
  events.sort((a, b) => a.tick - b.tick)
  let prevTick = 0
  for (const e of events) {
    e.deltaTime = e.tick - prevTick
    prevTick = e.tick
  }
  return events
}
