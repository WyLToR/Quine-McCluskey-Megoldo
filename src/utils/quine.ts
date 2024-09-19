type PrimeImplicantTable = {
  [primeImplicant: string]: boolean[];
};
function binaryConverter(num: number, bits: number): string {
  return num.toString(2).padStart(bits, "0");
}
function bitCounter(value: string): number {
  return [...value].reduce((acc, curr) => (curr === "1" ? acc + 1 : acc), 0);
}
function groupByBitCount(binaryMinterms: string[]): {
  [key: number]: string[];
} {
  const groups: { [key: number]: string[] } = {};

  binaryMinterms.forEach((bit: string) => {
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
      return -1;
    }
  }

  return diffCount === 1 ? diffIndex : -1;
}
function combineMinterms(groups: { [key: number]: string[] }): {
  [key: number]: string[];
} {
  const combinedGroups: { [key: number]: string[] } = {};
  const combinedMinterms = new Set<string>();

  Object.keys(groups).forEach((key) => {
    const currentGroup = groups[parseInt(key)];
    const nextKey = (parseInt(key) + 1).toString();
    const nextGroup = groups[parseInt(nextKey)] || [];

    currentGroup.forEach((minterm1) => {
      nextGroup.forEach((minterm2) => {
        const idx = mintermComparitive(minterm1, minterm2);
        if (idx !== -1) {
          const combinedMinterm =
            minterm1.slice(0, idx) + "-" + minterm1.slice(idx + 1);
          if (!combinedMinterms.has(combinedMinterm)) {
            combinedMinterms.add(combinedMinterm);

            if (!combinedGroups[parseInt(key)]) {
              combinedGroups[parseInt(key)] = [];
            }

            combinedGroups[parseInt(key)].push(combinedMinterm);
          }
        }
      });
    });
  });
  console.log("Combined Groups at step:", combinedGroups);

  return combinedGroups;
}
function recursiveCombine(groups: { [key: number]: string[] }): {
  [key: number]: string[];
} {
  const newGroups = combineMinterms(groups);
  const groupsString = JSON.stringify(groups);
  const newGroupsString = JSON.stringify(newGroups);
  if (groupsString === newGroupsString || Object.keys(newGroups).length === 0) {
    return groups;
  }
  return recursiveCombine(newGroups);
}
function createPrimeImplicantTable(
  primeImplicants: string[],
  minterms: number[],
  bits: number
): PrimeImplicantTable {
  const table: PrimeImplicantTable = {};

  primeImplicants.forEach((primeImplicant) => {
    table[primeImplicant] = minterms.map((minterm) => {
      return covers(primeImplicant, binaryConverter(minterm, bits));
    });
  });

  return table;
}
function covers(primeImplicant: string, minterm: string): boolean {
  for (let i = 0; i < primeImplicant.length; i++) {
    if (primeImplicant[i] !== "-" && primeImplicant[i] !== minterm[i]) {
      return false;
    }
  }
  return true;
}
function findEssentialPrimeImplicants(
  primeImplicantTable: PrimeImplicantTable
): string[] {
  const essentialPrimeImplicants: string[] = [];

  // Minden minterm vizsgálata
  for (const minterm of Object.keys(primeImplicantTable)) {
    let count = 0;
    let essentialPrimeImplicant = "";
    for (const primeImplicant of Object.keys(primeImplicantTable)) {
      if (primeImplicantTable[primeImplicant][parseInt(minterm)]) {
        count++;
        essentialPrimeImplicant = primeImplicant;
      }
    }
    if (count === 1) {
      essentialPrimeImplicants.push(essentialPrimeImplicant);
    }
  }

  return essentialPrimeImplicants;
}
export default function quine(
  minterms: number[],
  variables: string[]
): string[] {
  const bits = variables.length;
  const binaryMinterms: string[] = minterms.map((m) =>
    binaryConverter(m, bits)
  );
  const groupBits = groupByBitCount(binaryMinterms);
  console.log("groupbits", groupBits);
  const combinedGroups = recursiveCombine(groupBits);
  console.log("combinedgroups", combinedGroups);
  const primeImplicants = Object.values(combinedGroups).flat();
  console.log("Prime Implicants:", primeImplicants);
  const primeImplicantTable = createPrimeImplicantTable(
    primeImplicants,
    minterms,
    bits
  );
  console.log("Prime Implicant Table:", primeImplicantTable);
  const essentialPrimeImplicants =
    findEssentialPrimeImplicants(primeImplicantTable);
  console.log("Essential Prime Implicants:", essentialPrimeImplicants);
  return ["szisza"];
}
console.log(quine([0, 1, 2, 3], ["A", "B"])); // Várt eredmény: ['-1', '01-']

// testMintermComparitive();
// testCombineMinterms();
