import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";
import { FormData } from "./Form";
import { type RegisterName } from "./Form";

interface TextAreaProps {
    register: UseFormRegister<FormData>;
    unregister: UseFormUnregister<FormData>;
    registerName: RegisterName;
    errors: FieldErrors<FormData>;
    label: string;
    nameInRequired: string;
    minLength: number;
}
export default function TextArea({
    register,
    unregister,
    registerName,
    errors,
    label,
    nameInRequired,
    minLength,
}: TextAreaProps) {
    useEffect(() => {
        return () => {
            unregister(registerName);
        }
    }, []);
    return (
        <div className="txtContainer">
            <label className="lblRadio">
                {label} (minimum {minLength} characters):
            </label>
            <div className="txtAreaContainer">
                <textarea
                    className="freetext  shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-[--freetext-bg] dark:border-gray-700 dark:text-white dark:focus:ring-gray-600"
                    {...register(registerName)}
                    // {
                    //     required:
                    //         "The " +
                    //         nameInRequired +
                    //         " description is required.",
                    //     minLength: {
                    //         value: minLength,
                    //         message:
                    //             "Text must be at least " +
                    //             minLength +
                    //             " characters long.",
                    //     },
                    // }))}
                    placeholder={
                        "Enter the " + nameInRequired + " description here..."
                    }
                />
                {errors.textDescription && (
                    <span className="spanError">{errors.textDescription.message}</span>
                )}
            </div>
        </div>
    );
}
