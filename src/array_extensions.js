Array.prototype.deleteArray = function(arr) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (arr.indexOf(this[i]) >= 0) {
      this.splice(i, 1)
    }
  }
}

Array.prototype.remove = function(obj) {
    this.splice(this.indexOf(obj), 1)
}

Array.prototype.pushArray = function(arr) {
  Array.prototype.push.apply(this, arr)
}

Array.prototype.removeAll = function() {
  this.splice(0, this.length)
}

Array.range = function(a, b) {
  const arr = []
  for (var i = a; i <= b; i++) {
    arr.push(i)
  }
  return arr
}

Array.prototype.flatten = function() {
  return Array.prototype.concat.apply([], this)
}
