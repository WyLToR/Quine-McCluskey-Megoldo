"use strict";

import Minterm from "./Minterm";
import { decToBin, valueIn } from "./util";

export default class QuineMcCluskey {
  constructor(variables, values, dontCares = [], isMaxterm = false) {
    values.sort();
    this.variables = variables;
    this.values = values;
    this.allValues = values.concat(dontCares);
    this.allValues.sort();
    this.dontCares = dontCares;
    this.isMaxterm = isMaxterm;
    this.func = null;
    this.func = this.getFunction();
  }

  getBits(value) {
    let s = (value >>> 0).toString(2);
    for (let i = s.length; i < this.variables.length; i++) s = "0" + s;
    return s;
  }

  initialGroup() {
    let groups = [];
    for (let i = 0; i < this.variables.length + 1; i++) {
      groups.push([]);
    }

    for (const value of this.allValues) {
      let count = 0;
      let bits = this.getBits(value);
      for (const bit of bits) {
        if (bit == "1") {
          count += 1;
        }
      }

      groups[count].push(new Minterm([value], bits));
    }

    return groups;
  }

  powerSet(values, primeImplicants) {
    let powerset = [];

    for (let i = 1; i < 2 ** primeImplicants.length - 1; i++) {
      let currentset = [];

      let binValue = decToBin(i);
      for (let j = binValue.length; j < primeImplicants.length; j++) {
        binValue = "0" + binValue;
      }

      for (let j = 0; j < binValue.length; j++) {
        if (binValue.charAt(j) == "1") {
          currentset.push(primeImplicants[j]);
        }
      }
      powerset.push(currentset);
    }

    let newpowerset = [];
    for (const subset of powerset) {
      let tempValues = [];
      for (const implicant of subset) {
        for (const value of implicant.getValues()) {
          if (!valueIn(value, tempValues) && valueIn(value, values)) {
            tempValues.push(value);
          }
        }
      }
      tempValues.sort(function (number1, number2) {
        return number1 > number2;
      });

      if (
        tempValues.length == values.length &&
        tempValues.every(function (u, i) {
          return u === values[i];
        })
      ) {
        newpowerset.push(subset);
      }
    }
    powerset = newpowerset;

    let minSet = powerset[0];
    for (const subset of powerset) {
      if (subset.length < minSet.length) {
        minSet = subset;
      }
    }

    if (minSet == undefined) {
      return [];
    }
    return minSet;
  }

  getPrimeImplicants(groups = null) {
    if (groups === null) {
      groups = this.initialGroup();
    }

    if (groups.length == 1) {
      return groups[0];
    } else {
      let unused = [];
      let comparisons = [...Array(groups.length - 1).keys()];
      let newGroups = [];
      for (let i = 0; i < comparisons.length; i++) {
        newGroups.push([]);
      }

      for (const compare of comparisons) {
        let group1 = groups[compare];
        let group2 = groups[compare + 1];

        for (const term1 of group1) {
          for (const term2 of group2) {
            let term3 = term1.combine(term2);

            if (term3 !== null) {
              term1.use();
              term2.use();
              if (!valueIn(term3, newGroups[compare])) {
                newGroups[compare].push(term3);
              }
            }
          }
        }
      }

      for (const group of groups) {
        for (const term of group) {
          if (!term.isUsed() && !valueIn(term, unused)) {
            unused.push(term);
          }
        }
      }

      for (const term of this.getPrimeImplicants(newGroups)) {
        if (!term.isUsed() && !valueIn(term, unused)) {
          unused.push(term);
        }
      }

      return unused;
    }
  }

  solve() {
    let primeImplicants = this.getPrimeImplicants();
    let essentialPrimeImplicants = [];
    let valuesUsed = [];
    for (let i = 0; i < this.values.length; i++) {
      valuesUsed.push(false);
    }

    for (let i = 0; i < this.values.length; i++) {
      let value = this.values[i];

      let uses = 0;
      let last = null;
      for (const minterm of primeImplicants) {
        if (valueIn(value, minterm.getValues())) {
          uses += 1;
          last = minterm;
        }
      }
      if (uses == 1 && !valueIn(last, essentialPrimeImplicants)) {
        for (const v of last.getValues()) {
          if (!valueIn(v, this.dontCares)) {
            valuesUsed[this.values.indexOf(v)] = true;
          }
        }
        essentialPrimeImplicants.push(last);
      }
    }

    let found = false;
    for (const value of valuesUsed) {
      if (!value) {
        found = true;
        break;
      }
    }
    if (!found) {
      return essentialPrimeImplicants;
    }
    let newPrimeImplicants = [];
    for (const implicant of primeImplicants) {
      if (!valueIn(implicant, essentialPrimeImplicants)) {
        let add = false;
        for (const value of implicant.getValues()) {
          if (!valueIn(value, this.dontCares)) {
            add = true;
            break;
          }
        }
        if (add) {
          newPrimeImplicants.push(implicant);
        }
      }
    }
    primeImplicants = newPrimeImplicants;

    if (primeImplicants.length == 1) {
      return essentialPrimeImplicants.concat(primeImplicants);
    }

    let newValues = [];
    for (let i = 0; i < this.values.length; i++) {
      if (!valuesUsed[i]) {
        newValues.push(this.values[i]);
      }
    }

    this.powerSet(newValues, primeImplicants);

    return essentialPrimeImplicants.concat(
      this.powerSet(newValues, primeImplicants)
    );
  }

  getFunction() {
    if (this.func != null) {
      return this.func;
    }

    let primeImplicants = this.solve();

    if (primeImplicants.length == 0) {
      return "0";
    }

    if (primeImplicants.length == 1) {
      let count = 0;
      for (const index of primeImplicants[0].getValue()) {
        if (index == "-") {
          count += 1;
        }
      }
      if (count == this.variables.length) {
        return "1";
      }
    }

    let result = "";

    for (let i = 0; i < primeImplicants.length; i++) {
      let implicant = primeImplicants[i];
      if (
        (implicant.getValue().match(/-/g) || []).length <
        this.variables.length - 1
      ) {
        result += "(";
      }

      for (let j = 0; j < implicant.getValue().length; j++) {
        if (implicant.getValue().charAt(j) == (this.isMaxterm ? "1" : "0")) {
          result += "¬";
        }
        if (implicant.getValue().charAt(j) != "-") {
          result += this.variables[j];
        }
        if (
          (
            implicant
              .getValue()
              .substring(j + 1)
              .match(/-/g) || []
          ).length <
            implicant.getValue().length - j - 1 &&
          implicant.getValue().charAt(j) != "-"
        ) {
          result += this.isMaxterm ? "+" : "•";
        }
      }

      if (
        (implicant.getValue().match(/-/g) || []).length <
        this.variables.length - 1
      ) {
        result += ")";
      }

      if (i < primeImplicants.length - 1) {
        result += this.isMaxterm ? "•" : "+";
      }
    }

    return result;
  }
}
