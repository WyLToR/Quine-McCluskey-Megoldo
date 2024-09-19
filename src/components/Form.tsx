import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import quineInterface from "../interface/quineInterface";

export default function Form({
  formData,
  setFormData,
  submit,
}: {
  formData: quineInterface;
  setFormData: React.Dispatch<React.SetStateAction<quineInterface>>;
  submit: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [errorMsg, setErrorMsg] = useState({
    minTerms: "",
    variables: "",
  });
  const handleMinterms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nums = e.target.value
      .split(",")
      .map((val: string) => val.trim())
      .map((val: string) => Number(val));

    const hasError = nums.some((val: number) => isNaN(val));

    if (hasError) {
      setErrorMsg({
        ...errorMsg,
        minTerms:
          "A megadott számok között találtunk hibás értéket, kérlek javítsd",
      });
    } else {
      setFormData({ ...formData, minTerms: nums });
      setErrorMsg({
        ...errorMsg,
        minTerms: "",
      });
    }
  };
  const handleVariables = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vars = e.target.value
      .split(",")
      .map((val: string) => val.trim())
      .map((val: string) => val.toUpperCase());
    const hasError = vars.some((val: string) => {
      const trimmedVal = val.trim();
      return trimmedVal === "" || !isNaN(Number(trimmedVal));
    });

    if (hasError) {
      setErrorMsg({
        ...errorMsg,
        variables: "A megadott változók között hibát találtunk, kérlek javítsd",
      });
    } else {
      setFormData({ ...formData, variables: vars });
      setErrorMsg({
        ...errorMsg,
        variables: "",
      });
    }
  };
  return (
    <form
      className="w-96 h-96 flex flex-col gap-3 backdrop-blur-lg m-20 p-10"
      onSubmit={(e) => {
        e.preventDefault();
        submit((e) => !e);
      }}
    >
      <Input
        label={"Mintermek (','-t használj)"}
        type={"text"}
        placeholder={"pl.: 1,2,3,4"}
        onBlur={handleMinterms}
        error={errorMsg.minTerms}
      />
      <Input
        label={"Változók (','-t használj)"}
        type={"text"}
        placeholder={"pl.: A,B,C,D"}
        onBlur={handleVariables}
        error={errorMsg.variables}
      />
      <div className="flex justify-center">
        <Button type="submit" text="Küldés" />
      </div>
    </form>
  );
}
