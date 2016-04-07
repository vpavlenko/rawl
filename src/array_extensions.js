Array.prototype.deleteArray = function(arr) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (arr.indexOf(this[i]) >= 0) {
      this.splice(i, 1)
    }
  }
}

Array.prototype.pushArray = function(arr) {
  Array.prototype.push.apply(this, arr)
}

Array.range = function(a, b) {
  var arr = []
  for (var i = a; i <= b; i++) {
    arr.push(i)
  }
  return arr
}