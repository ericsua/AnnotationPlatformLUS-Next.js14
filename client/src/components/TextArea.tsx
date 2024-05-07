import { FormData, RegisterName } from "@/types/FormSchema";
import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";

// Props for the TextArea component
interface TextAreaProps {
    register: UseFormRegister<FormData>;
    unregister: UseFormUnregister<FormData>;
    registerName: RegisterName;
    errors: FieldErrors<FormData>;
    label: string;
    nameInRequired: string;
    minLength: number;
}

/**
 * A text area component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.register - The register function from the react-hook-form library.
 * @param {Function} props.unregister - The unregister function from the react-hook-form library.
 * @param {string} props.registerName - The name to be used when registering the input.
 * @param {Object} props.errors - The errors object from react-hook-form.
 * @param {string} props.label - The label text for the text area, i.e. the question or description of the text area.
 * @param {string} props.nameInRequired - The name of the input displayed in the required message.
 * @param {number} props.minLength - The minimum length of the text area.
 * @returns {JSX.Element} The rendered TextArea component.
 */
export default function TextArea({
    register,
    unregister,
    registerName,
    errors,
    label,
    nameInRequired,
    minLength,
}: TextAreaProps) {
    // Unregister the text area when the component is unmounted
    useEffect(() => {
        return () => {
            unregister(registerName);
        }
    }, []);
    return (
        <div className="txtContainer">
            <label className="lblRadio">
                {label} (Minimum {minLength} characters):
            </label>
            <div className="txtAreaContainer">
                <textarea
                    className="freetext  shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-[--freetext-bg] dark:border-gray-700 dark:text-white dark:focus:ring-gray-600"
                    {...register(registerName)}
                    placeholder={
                        "Enter the " + nameInRequired + " description here..."
                    }
                />
                {/* Display an error message */}
                {errors.textDescription && (
                    <span className="spanError">{errors.textDescription.message}</span>
                )}
            </div>
        </div>
    );
}
