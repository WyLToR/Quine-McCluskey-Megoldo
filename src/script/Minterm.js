export default class Minterm {

  constructor(values, value) {
    this.values = values;
    this.value = value;
    this.used = false;
    this.values = [...values].sort((a, b) => a - b); 
  }

  toString() {
    let values = this.values.join(", ");
    return `m(${values}) = ${this.value}`;
  }

  equals(minterm) {
    if (!(minterm instanceof Minterm)) {
      return false;
    }

    return (
      this.value == minterm.value &&
      this.values.length == minterm.values.length &&
      this.values.every(function (u, i) {
        return u === minterm.values[i];
      })
    );
  }

  getValues() {
    return this.values;
  }

  getValue() {
    return this.value;
  }

  isUsed() {
    return this.used;
  }

  use() {
    this.used = true;
  }

  combine(minterm) {
    if (this.value == minterm.value) {
      return null;
    }

    if (
      this.values.length == minterm.values.length &&
      this.values.every(function (u, i) {
        return u === minterm.values[i];
      })
    ) {
      return null;
    }

    let diff = 0;
    let result = "";

    for (const i in this.value) {
      if (this.value.charAt(i) != minterm.value.charAt(i)) {
        diff += 1;
        result += "-";
      }

      else {
        result += this.value.charAt(i);
      }

      if (diff > 1) {
        return null;
      }
    }

    return new Minterm(this.values.concat(minterm.values), result);
  }
}
