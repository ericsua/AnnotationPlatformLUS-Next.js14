import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormData } from "./Form";
import RadioInput from "./RadioInput";

interface RadioBoxProps {
    name: keyof FormData;
    control: Control<FormData>;
    errors: FieldErrors<FormData>;
    label: string;
    options: string[];
}

export default function RadioBox({ name, control, errors, label, options }: RadioBoxProps) {
    return <div className="radioContainer">
            <b><label className="lblRadio">
                {label}
            </label></b>
            <div>
            <Controller
                name={name}
                control={control}
                defaultValue=""
                rules={{ required: "Please select an option for " + name }}
                render={({ field }) => (
                <>
                    {options.map((option, index) => (
                        <RadioInput key={index} field={field} value={option} />
                    ))}
                    {/* <RadioInput field={field} options={options} value="option1A" />
                    <label>
                    <input type="radio" {...field} value="option1A" /> {options[0]}
                    </label>
                    <br />
                    <label>
                    <input type="radio" {...field} value="option1B" /> Option 1B
                    </label>
                    <br />
                    <label>
                    <input type="radio" {...field} value="option1C" /> Option 1C
                    </label>
                    <br /> */}
                </>
                )}
            />
            {errors.option1 && (
                <span className="spanError">{errors.option1.message}</span>
            )}
            </div>
    </div>
}