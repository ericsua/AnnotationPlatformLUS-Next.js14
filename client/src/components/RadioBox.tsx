import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";
import { FormData } from "@/types/FormSchema";
import RadioInput from "./RadioInput";
import { type RegisterName } from "@/types/FormSchema";
import { get } from "lodash";

interface RadioBoxProps {
    //control: Control<FormData>;r
    register: UseFormRegister<FormData>;
    unregister: UseFormUnregister<FormData>;
    registerName: RegisterName;
    errors: FieldErrors<FormData>;
    label: string;
    options: any[];
    optionsLabels: string[];
    isBoolean: boolean;
    nesting?: number;
}

// export default function RadioBox({ name, control, errors, label, options }: RadioBoxProps) {
export default function RadioBox({
    register,
    unregister,
    registerName,
    errors,
    label,
    options,
    optionsLabels,
    isBoolean = false,
    nesting = 0,
}: RadioBoxProps) {
    useEffect(() => {
        return () => {
            unregister(registerName);
        }
    }, []);
    return (
        <div className="mb-5" style={{ marginLeft: `${nesting}rem` }}>
            <label className="lblRadio">{label}</label>
            <div>
                {options.map((option, index) => (
                    <RadioInput
                        key={option}
                        value={option}
                        register={register}
                        registerName={registerName}
                        label={optionsLabels[index]}
                        isBoolean={isBoolean}
                    />
                ))}
                {get(errors, registerName) && (
                    <span className="spanError">
                        {get(errors, registerName)?.message}
                    </span>
                )}
            </div>
        </div>
    );
}
