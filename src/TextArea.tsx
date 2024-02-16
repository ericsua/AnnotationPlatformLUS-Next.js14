import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormData } from "./Form";

interface TextAreaProps {
    control: Control<FormData>;
    errors: FieldErrors<FormData>;
    label: string;
    nameInRequired: string;
    minLength: number;
}
export default function TextArea({ control, errors, label, nameInRequired, minLength }: TextAreaProps) {
    return (
        <div className="txtContainer">
            <label className="lblRadio">
                {label} (minimum {minLength} characters):
            </label>
            <div className="txtAreaContainer">
                <Controller
                    name="text"
                    control={control}
                    defaultValue=""
                    rules={{
                        required:
                            "The " + nameInRequired + " description is required, and must be at least 50 characters long.",
                        minLength: {
                            value: minLength,
                            message: "Text must be at least " + minLength + " characters long",
                        },
                    }}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            placeholder={"Enter your " + nameInRequired + " description here..."}
                        />
                    )}
                />
                {errors.text && (
                    <span className="spanError">{errors.text.message}</span>
                )}
            </div>
        </div>
    );
}
