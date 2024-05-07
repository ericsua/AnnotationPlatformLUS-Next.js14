import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";
import { FormData } from "@/types/FormSchema";
import RadioInput from "./RadioInput";
import { type RegisterName } from "@/types/FormSchema";
import { get } from "lodash";

// Props for the RadioBox component
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
// Component for a radio box in a form 
/**
 * RadioBox component represents a group of radio buttons in a form.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.register - The function to register the radio box with react-hook-form.
 * @param {Function} props.unregister - The function to unregister the radio box with react-hook-form.
 * @param {string} props.registerName - The name of the radio box in the form (for react-hook-form registration and id).
 * @param {Object} props.errors - The errors object from react-hook-form.
 * @param {string} props.label - The label for the radio box, i.e. the question or description of the radio box
 * @param {string[]} props.options - The options for the radio box as values (e.g. ["true", "false"]).
 * @param {string[]} props.optionsLabels - The labels for the radio box options (e.g. ["Yes", "No"]).
 * @param {boolean} [props.isBoolean=false] - Indicates whether the radio box represents a boolean value.
 * @param {number} [props.nesting=0] - The nesting level of the radio box in the form (for indentation).
 * @returns {JSX.Element} The rendered RadioBox component.
 */
export default function RadioBox({
    register,
    unregister,
    registerName, // name of the radio box in the form (for react-hook-form registration and id)
    errors,
    label,
    options, // options for the radio box as values (e.g. ["true", "false"])
    optionsLabels, // labels for the radio box options (e.g. ["Yes", "No"])
    isBoolean = false,
    nesting = 0, // nesting level of the radio box in the form (for indentation)
}: RadioBoxProps) {

    // Unregister the radio box when the component is unmounted
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
                {/* Display error message if there is an error, the lodash get function allows to get an element of an object given 
                a path (e.g. pleuralLine.isPresent) */}
                {get(errors, registerName) && (
                    <span className="spanError">
                        {get(errors, registerName)?.message}
                    </span>
                )}
            </div>
        </div>
    );
}
