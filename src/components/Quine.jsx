import { useState } from "react";
import QuineMcCluskey from "../script/QuineMcCluskey";
import { decToBin } from "../script/util";

export default function Quine() {
  const [simplifiedExpression, setSimplifiedExpression] = useState("");
  const [error, setError] = useState({
    minTerms: "",
    variables: "",
    error: false,
  });
  const [isMaxterm, setIsMaxterm] = useState(false);
  const [values, setValues] = useState({
    minTerms: "",
    variables: "",
    dontCare: "",
  });
  const checkVarsLength = (terms, vars, dontCares) => {
    const maxValue = terms.reduce((prev, curr) => Math.max(prev, curr));

    const requiredBits = Math.ceil(Math.log2(maxValue + 1));

    const cleanedVars = vars.map((v) => v.trim());

    if (cleanedVars.length < requiredBits) {
      setError({
        minTerms: `A "${maxValue}" érték leírásához ${requiredBits} változó szükséges, de csak ${cleanedVars.length} változót adtál meg.`,
        variables: `A "${maxValue}" érték leírásához ${requiredBits} változó szükséges.`,
        error: false,
      });
      return;
    }

    setError({
      minTerms: ``,
      variables: ``,
      error: true,
    });

    const invalidDontCares =
      dontCares.length > 0
        ? dontCares.filter((value) => !terms.includes(value))
        : [];

    if (invalidDontCares.length > 0) {
      setError({
        minTerms: `A ${invalidDontCares.join(
          ", "
        )} számok nem szerepelnek a megadott "terms" listában.`,
        variables: ``,
        error: false,
      });
    } else {
      setError({
        minTerms: ``,
        variables: ``,
        error: true,
      });
    }

    const maxTermBinaryLength = terms.map((term) => decToBin(term).length);
    const maxBinaryLength = Math.max(...maxTermBinaryLength);

    if (maxBinaryLength > cleanedVars.length) {
      setError({
        minTerms: `A bináris számokhoz ${maxBinaryLength} bit szükséges, de csak ${cleanedVars.length} változót adtál meg.`,
        variables: `A bináris számokhoz ${maxBinaryLength} bit szükséges.`,
        error: false,
      });
      return;
    }
  };

  const algorithm = () => {
    const minterms = values.minTerms
      .split(",")
      .map((num) => num.trim())
      .map(Number);
    const dontCares = values.dontCare
      ? values.dontCare
          .split(",")
          .map((num) => num.trim())
          .map(Number)
      : [];
    console.log(values.dontCare);
    const variables = values.variables.split(",").map((v) => v.trim());
    checkVarsLength(minterms, variables, dontCares);

    if (error.error) {
      const f = new QuineMcCluskey(
        variables.join(""),
        minterms,
        dontCares,
        isMaxterm
      );
      const simplified = f.getFunction();
      setSimplifiedExpression(simplified);
    }
  };

  return (
    <section className="relative flex justify-center items-center h-screen">
      <a
        target="_blank"
        className="abolute left-0 top-0 z-20"
        href="https://www.github.com/WyLToR"
      >
        Github
      </a>
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/bg_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <form
        className="w-full md:m-10 p-5 md:p-20 flex flex-col gap-3 backdrop-blur-xl"
        onSubmit={(e) => {
          e.preventDefault();
          algorithm();
        }}
      >
        <label className="block w-full mb-2 text-md font-medium text-white">
          Változók
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            type={"text"}
            placeholder={"pl.: A,B,C,D"}
            value={values.variables}
            onChange={(e) =>
              setValues({ ...values, variables: e.target.value })
            }
          />
          {error.variables ? (
            error.variables
          ) : (
            <>
              <div className="p-3"></div>
            </>
          )}
        </label>

        <label className="block mb-2 text-md font-medium text-white">
          Mintermek
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            type={"text"}
            placeholder={"pl.: 1,2,3,4"}
            value={values.minTerms}
            onChange={(e) => setValues({ ...values, minTerms: e.target.value })}
          />
          {error.minTerms ? (
            error.minTerms
          ) : (
            <>
              <div className="p-3"></div>
            </>
          )}
        </label>

        <label className="block mb-2 text-md font-medium text-white">
          Nem érdekel
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            type={"text"}
            placeholder={"pl.: 1,2,3,4"}
            value={values.dontCare}
            onChange={(e) => setValues({ ...values, dontCare: e.target.value })}
          />
          {error.dontCare ? (
            error.dontCare
          ) : (
            <>
              <div className="p-3"></div>
            </>
          )}
        </label>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isMaxterm}
            onChange={() => setIsMaxterm(!isMaxterm)}
          />
          <label className="ml-2">Maxterm módszer</label>
        </div>

        <div className="flex justify-center">
          <button
            type={"submit"}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {"Küldés"}
          </button>
        </div>
        <div className="flex items-center justify-center">
          {simplifiedExpression ? (
            <div className="font-mono text-lg border-2">
              {simplifiedExpression}
            </div>
          ) : (
            <div className="font-mono text-lg p-4"></div>
          )}
        </div>
      </form>
    </section>
  );
}
