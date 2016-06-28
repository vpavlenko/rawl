"use strict"

class ArrayStore {
  constructor(items = []) {
    this.items = items
    this.lastId = 0
  }

  add(item) {
    item.id = this.lastId
    this.items.push(item)
    this.lastId++
    return item
  }

  addAll(arr) {
    arr.forEach(item => this.add(item))
  }

  getById(id) {
    for (const item of this.items) {
      if (item.id == id) {
        return item
      }
    }
    return null
  }

  getAll() {
    return this.items
  }

  removeById(id) {
    this.items.remove(this.getById(id))
  }

  bind(shi) {
    shi.resource(":id", req => {
      if (req.params.id == "*") {
        return this.getAll()
      }
      return this.getById(req.params.id)
    })

    shi.onUp("create", "", req => {
      return this.add(req.value)
    })

    shi.onUp("update", ":id/:property", req => {
      const item = this.getById(req.params.id)
      const oldValue = item[req.params.property]
      if (oldValue != req.value) {
        item[req.params.property] = req.value
      }
      return item
    })

    shi.onUp("remove", ":id", req => {
      this.removeById(req.params.id)
      return true
    })
  }

  static createAction(shi) {
    return {
      create: obj => shi.create("", obj),
      remove: id => shi.remove(`${id}`),
      get: id => shi.get(id),
      getAll: id => shi.get("*"),
      update: (id, prop, value) => shi.update(`${id}/${prop}`, value)
    }
  }
}
