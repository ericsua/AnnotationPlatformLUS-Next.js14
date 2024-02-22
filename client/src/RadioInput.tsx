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
            <label>
                <input
                    type="radio"
                    {...register(registerName, {
                        required: "Please select an option for " + registerName,
                    })}
                    value={value}
                    
                />
                {" " + value}
            </label>
            <br />
        </>
    );
}
