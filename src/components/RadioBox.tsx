import React, { useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormData } from "./Form";
import RadioInput from "./RadioInput";
import { type RegisterName } from "./Form";

interface RadioBoxProps {
    //control: Control<FormData>;r
    register: UseFormRegister<FormData>;
    registerName: RegisterName;
    errors: FieldErrors<FormData>;
    label: string;
    options: string[];
}

// export default function RadioBox({ name, control, errors, label, options }: RadioBoxProps) {
export default function RadioBox({ register, registerName, errors, label, options }: RadioBoxProps) {

    return <div className="radioContainer">
            <label className="lblRadio"  >
                {label}
            </label>
            <div  >
            {
                options.map((option) => (
                    <RadioInput key={option} value={option} register={register} registerName={registerName}/>
            ))}
            {errors[registerName] && (
                <span className="spanError">{errors[registerName]?.message}</span>
            )}
            </div>
    </div>
}