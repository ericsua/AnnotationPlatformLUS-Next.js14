import React from "react";
import { UseFormRegister } from "react-hook-form";
import { FormData } from "./Form";
import { type RegisterName } from "./Form";

interface RadioInputProps {
    //field: ControllerRenderProps<FormData>;
    value: string;
    register: UseFormRegister<FormData>;
    registerName: RegisterName;
}

export default function RadioInput({
    value,
    register,
    registerName,
}: RadioInputProps) {
    return (
        <>
            <label className="flex items-center w-fit">
                <input
                    className="dark:bg-gray-800 dark:text-white"
                    type="radio"
                    {...register(registerName, {
                        required: "Please select an option for " + registerName,
                    })}
                    value={value}
                />
                <span className="px-4 align-baseline">{" " + value}</span>
            </label>
        </>
    );
}
