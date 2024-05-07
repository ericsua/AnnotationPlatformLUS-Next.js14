import React from "react";
import { UseFormRegister } from "react-hook-form";
import { FormData } from "@/types/FormSchema";
import { type RegisterName } from "@/types/FormSchema";

// Props for the RadioInput component
interface RadioInputProps {
    //field: ControllerRenderProps<FormData>;
    value: string;
    register: UseFormRegister<FormData>;
    registerName: RegisterName;
    label: string;
    isBoolean: boolean;
}


/**
 * A radio input component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.value - The value of the radio input.
 * @param {Function} props.register - The register function from the react-hook-form library.
 * @param {string} props.registerName - The name to be used when registering the input.
 * @param {string} props.label - The label text for the radio input.
 * @param {boolean} props.isBoolean - Indicates whether the value is a boolean.
 * @returns {JSX.Element} The rendered RadioInput component.
 */
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
