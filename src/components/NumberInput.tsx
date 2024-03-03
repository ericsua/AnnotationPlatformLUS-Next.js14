import React, { useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormUnregister } from "react-hook-form";
import { FormData } from "./Form";
import { type RegisterName } from "./Form";
import { get } from "lodash";

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
    useEffect(() => {
        return () => {
            unregister(registerName);
        }
    
    }, [])
    return (
        <>
            {/* <label className="block text-sm font-medium mb-2 dark:text-white">
                <div className="relative">
                    <input
                        className="dark:bg-gray-800 dark:text-white"
                        type="number"
                        {...register(registerName, {
                            required: "Please insert a number in " + nameInRequired,
                        })}
                        min={min}
                        max={max}
                        step={step}
                        placeholder={placeholder}
                    />
                    <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none z-10 pe-4">
                        <span className="text-gray-500">cm</span>
                    </div>
                    <span className="px-4 align-baseline">{" " + label}</span>
                </div>
            </label> */}
            <div className="mb-5">
                <label htmlFor={registerName} className="lblRadio">
                    {label}
                </label>
                <div className="ml-4">
                <div className="flex rounded-lg shadow-sm mb-2 w-fit">
                    <input
                        // {...register(registerName, {
                        //     required: "Please insert a number",
                        //     min: {
                        //         value: min,
                        //         message: "Minimum value is " + min,
                        //     },
                        //     max: {
                        //         value: max,
                        //         message: "Maximum value is " + max,
                        //     },
                        // })}
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

{
    /* <div>
  <label for={registerName} className="sr-only">Multiple add-on</label>
  <div className="flex rounded-lg shadow-sm">
    <input  {...register(registerName, {required: "Please insert a number in " + nameInRequired,})}  type="number" id={registerName} name={registerName}  min={min} max={max} step={step} placeholder={placeholder} className="py-3 px-4 block w-full border-gray-200 shadow-sm rounded-lg rounded-e-none text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" placeholder="www.example.com">
    <div className="px-4 inline-flex items-center min-w-fit rounded-e-md border border-s-0 border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      <span className="text-sm text-gray-500 dark:text-gray-400">0.00</span>
    </div>
  </div>
</div> */
}

{
    /* <label for="hs-input-with-leading-and-trailing-icon" class="block text-sm font-medium mb-2 dark:text-white">Price</label>
  <div class="relative">
    <input type="text" class="py-3 px-4 ps-9 pe-16 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" placeholder="0.00">
    <div class="absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-4">
      <span class="text-gray-500">USD</span>
    </div>
  </div> */
}
