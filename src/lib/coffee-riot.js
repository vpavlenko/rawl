// http://k33g.github.io/2015/03/25/RIOT-TRANSPILERS.html

window.require = (module) => {
  if (module == "coffee-script") {
    this.compile = (js, param) => {
      return CoffeeScript.compile(js, param);
    }
  }
  return this;
}
