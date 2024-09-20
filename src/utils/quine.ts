type PrimeImplicantTable = {
  [primeImplicant: string]: boolean[];
};

function binaryConverter(num: number, bits: number): string {
  return num.toString(2).padStart(bits, '0');
}

function bitCounter(value: string): number {
  return [...value].reduce((acc, curr) => (curr === '1' ? acc + 1 : acc), 0);
}

function groupByBitCount(binaryMinterms: string[]): { [key: number]: string[] } {
  const groups: { [key: number]: string[] } = {};
  binaryMinterms.forEach((bit) => {
    const count = bitCounter(bit);
    if (!groups[count]) {
      groups[count] = [];
    }
    groups[count].push(bit);
  });
  return groups;
}

function mintermComparitive(minterm1: string, minterm2: string): number {
  let diffCount = 0;
  let diffIndex = -1;

  for (let i = 0; i < minterm1.length; i++) {
    if (minterm1[i] !== minterm2[i]) {
      diffCount++;
      diffIndex = i;
    }
    if (diffCount > 1) {
      return -1; // Túl sok eltérés
    }
  }
  return diffCount === 1 ? diffIndex : -1;
}

function combineMinterms(groups: { [key: number]: string[] }): { [key: number]: string[] } {
  const combinedGroups: { [key: number]: string[] } = {};
  const combinedMinterms = new Set<string>();

  Object.keys(groups).forEach((key) => {
    const currentGroup = groups[parseInt(key)];
    const nextGroup = groups[parseInt(key) + 1] || [];

    currentGroup.forEach((minterm1) => {
      nextGroup.forEach((minterm2) => {
        const idx = mintermComparitive(minterm1, minterm2);
        if (idx !== -1) {
          const combinedMinterm = minterm1.slice(0, idx) + "-" + minterm1.slice(idx + 1);
          if (!combinedMinterms.has(combinedMinterm)) {
            combinedMinterms.add(combinedMinterm);
            const newGroupIndex = Math.max(...Object.keys(groups).map(Number));
            combinedGroups[newGroupIndex] = combinedGroups[newGroupIndex] || [];
            combinedGroups[newGroupIndex].push(combinedMinterm);
          }
        }
      });
    });
  });

  return combinedMinterms.size > 0 ? combinedGroups : groups;
}




function recursiveCombine(groups: { [key: number]: string[] }): { [key: number]: string[] } {
  const newGroups = combineMinterms(groups);
  if (JSON.stringify(groups) === JSON.stringify(newGroups) || Object.keys(newGroups).length === 0) {
    return groups;
  }
  return recursiveCombine(newGroups);
}

function covers(primeImplicant: string, minterm: string): boolean {
  for (let i = 0; i < primeImplicant.length; i++) {
    if (primeImplicant[i] !== '-' && primeImplicant[i] !== minterm[i]) {
      return false;
    }
  }
  return true;
}

function createPrimeImplicantTable(
  primeImplicants: string[],
  minterms: number[],
  bits: number
): PrimeImplicantTable {
  const table: PrimeImplicantTable = {};

  primeImplicants.forEach((primeImplicant) => {
    table[primeImplicant] = minterms.map((minterm) => {
      const binaryMinterm = binaryConverter(minterm, bits);
      return covers(primeImplicant, binaryMinterm);
    });
  });

  return table;
}


function findEssentialPrimeImplicants(primeImplicantTable: PrimeImplicantTable): string[] {
  const essentialPrimeImplicants: string[] = [];
  const mintermCounts: { [minterm: number]: number } = {};
  const essentialCandidates: { [minterm: number]: string } = {};

  // Számoljuk meg a mintermeket
  for (const prime in primeImplicantTable) {
    for (let i = 0; i < primeImplicantTable[prime].length; i++) {
      if (primeImplicantTable[prime][i]) {
        mintermCounts[i] = (mintermCounts[i] || 0) + 1;
        essentialCandidates[i] = prime; // A mintermhez tartozó prime implicant
      }
    }
  }

  for (const minterm in mintermCounts) {
    if (mintermCounts[minterm] === 1) {
      essentialPrimeImplicants.push(essentialCandidates[minterm]);
    }
  }

  return essentialPrimeImplicants;
}





const quine = (minterms: number[], variables: string[]) => {
  const bits = variables.length;
  const binaryMinterms = minterms.map(num => binaryConverter(num, bits));

  // console.log("Binary Minterms:", binaryMinterms);

  const groups = groupByBitCount(binaryMinterms);
  // console.log("Grouped Bits:", groups);

  const combinedGroups = recursiveCombine(groups);
  // console.log("Combined Groups:", combinedGroups);

  const primeImplicants = Object.values(combinedGroups).flat();
  // console.log("Prime Implicants:", primeImplicants);

  const primeImplicantTable = createPrimeImplicantTable(primeImplicants, minterms, bits);
  // console.log("Prime Implicant Table:", primeImplicantTable);

  const essentialPrimeImplicants = findEssentialPrimeImplicants(primeImplicantTable);
  // console.log("Essential Prime Implicants:", essentialPrimeImplicants);

  return essentialPrimeImplicants.length > 0 ? essentialPrimeImplicants : primeImplicants;
};

export default quine

console.log(`Várt eredmény: ["-1", "01-"]`); // Várt eredmény: ["-1", "01-"], kapott: ["0-", "-0", "-1", "1-"]
console.log("kapott:", quine([0, 1, 2, 3], ["A", "B"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: ["000", "001", "010", "011", "100", "101", "110", "111"]`); // Várt eredmény: ["000", "001", "010", "011", "100", "101", "110", "111"], kapott: ["00-", "0-0", "-00", "0-1", "-01", "01-", "-10", "10-", "1-0", "-11", "1-1", "11-"]
console.log("kapott:", quine([0, 1, 2, 3, 4, 5, 6, 7], ["A", "B", "C"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: ["01-", "1-"]`); // Várt eredmény: ["01-", "1-"], kapott: ["-1","1-"]
console.log("kapott:", quine([1, 2, 3], ["A", "B"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: ["01-", "1-"]`); // Várt eredmény: , kapott: ["01-"]
console.log("kapott:", quine([1, 2, 3, 5, 7], ["A", "B", "C"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: ["00"]`); // Várt eredmény: , kapott: ["00"]
console.log("kapott:", quine([0], ["A", "B"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: []`); // Várt eredmény: , kapott: []
console.log("kapott:", quine([], ["A", "B"]))
console.log("------------------------------------------------")
console.log(`Várt eredmény: ["-1", "01-"]`); // Várt eredmény: , kapott: ["0-",  "-1"]
console.log("kapott:", quine([0, 1, 3], ["A", "B"]))
console.log("------------------------------------------------")
