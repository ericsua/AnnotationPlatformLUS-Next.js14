
import React from "react";
import { ControllerRenderProps } from "react-hook-form";
import { FormData } from "./Form";

interface RadioInputProps {
    field: ControllerRenderProps<FormData>;
    value: string;
}

export default function RadioInput({ field, value }: RadioInputProps) {
  return (
    <>
      <label>
        <input type="radio" {...field} value={value}/> {value}
      </label>
      <br />
    </>
  );
}
