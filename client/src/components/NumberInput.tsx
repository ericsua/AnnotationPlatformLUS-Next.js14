import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";
import { get } from "lodash";
import { FormData, type RegisterName } from "@/types/FormSchema";

// Props for the NumberInput component
interface NumberInputProps {
    //field: ControllerRenderProps<FormData>;
    register: UseFormRegister<FormData>;
    unregister: UseFormUnregister<FormData>;
    registerName: RegisterName;
    nameInRequired: string;
    errors: FieldErrors<FormData>;
    label: string;
    min: number;
    max: number;
    step: number;
    placeholder: string;
}

// Component for a number input field in a form (e.g. for height or width of the pleural line)
// currently not used in the project, but can be used in the future
export default function NumberInput({
    register,
    unregister,
    registerName,
    errors,
    label,
    nameInRequired,
    min,
    max,
    step,
    placeholder,
}: NumberInputProps) {

    // Unregister the input field when the component is unmounted (probably not needed?)
    useEffect(() => {
        return () => {
            unregister(registerName);
        }
    
    }, [])
    return (
        <>
            <div className="mb-5">
                <label htmlFor={registerName} className="lblRadio">
                    {label}
                </label>
                <div className="ml-4">
                <div className="flex rounded-lg shadow-sm mb-2 w-fit">
                    <input
                        type="number"
                        id={registerName}
                        {...register(registerName)}
                        min={min}
                        max={max}
                        step={step}
                        placeholder={placeholder}
                        className="py-3 px-4 block text-sm bg-[--freetext-bg] border border-solid border-e-0 border-gray-300 shadow-sm rounded-lg rounded-e-none focus:z-10 focus:outline-blue-500 focus:outline-1 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-[--freetext-bg] dark:border-solid dark:border-gray-700 dark:border dark:border-e-0 dark:text-white dark:focus:ring-gray-600"
                    />
                    <div className="px-4 inline-flex items-center min-w-fit rounded-e-lg border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <span className="text-gray-500 dark:text-gray-400">
                            cm
                        </span>
                    </div>
                    
                </div>
                {/* lodash function to get the error message for the input field using a string as index of an object (e.g. pleuralEffusion.specifics.isSeptaPresent) */}
                {get(errors, registerName) && (
                        <span className="spanError">
                            {get(errors, registerName)?.message}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}
