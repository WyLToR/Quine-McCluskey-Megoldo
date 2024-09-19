import { useEffect, useState } from "react";
import Form from "./Form";
import quineInterface from "../interface/quineInterface";
import quine from "../utils/quine";

export default function Quine() {
  const [formData, setFormData] = useState<quineInterface>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  useEffect(() => {
    if (submitted && formData) {
      console.log(quine(formData.minTerms, formData.variables));
      setSubmitted((e) => !e);
    }
  }, [submitted]);
  return (
    <>
      {submitted || (
        <Form
          formData={formData}
          setFormData={setFormData}
          submit={setSubmitted}
        />
      )}
      {}
    </>
  );
}
