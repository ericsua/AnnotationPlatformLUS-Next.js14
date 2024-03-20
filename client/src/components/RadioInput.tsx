import React from "react";
import { UseFormRegister } from "react-hook-form";
import { FormData } from "@/types/FormSchema";
import { type RegisterName } from "@/types/FormSchema";

interface RadioInputProps {
    //field: ControllerRenderProps<FormData>;
    value: string;
    register: UseFormRegister<FormData>;
    registerName: RegisterName;
    label: string;
    isBoolean: boolean;
}

export default function RadioInput({
    value,
    register,
    registerName,
    label,
    isBoolean,
}: RadioInputProps) {
    return (
        <>
            <label className="flex items-center w-fit py-1">
                <input
                    className="flex-shrink-0 dark:bg-gray-800 dark:text-white"
                    type="radio"
                    {...register(registerName)}
                    value={value}
                />

                <span className="px-4 align-baseline">{" " + label}</span>
            </label>
        </>
    );
}
