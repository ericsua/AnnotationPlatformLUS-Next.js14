import { zodUserLoginType, zodUserNewPasswordType, zodUserRegisterType, zodUserResetType } from "@/types/Authentication";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type InputAuthLoginProps = {
    registerName: keyof zodUserLoginType;
    label: string;
    register: UseFormRegister<zodUserLoginType>;
    errors: FieldErrors<zodUserLoginType>;
    placeholder: string;
    disabled?: boolean;
    type: string;
};

type InputAuthResetProps = {
    registerName: keyof zodUserResetType;
    label: string;
    register: UseFormRegister<zodUserResetType>;
    errors: FieldErrors<zodUserResetType>;
    placeholder: string;
    disabled?: boolean;
    type: string;
};

type InputAuthNewPasswordProps = {
    registerName: keyof zodUserNewPasswordType;
    label: string;
    register: UseFormRegister<zodUserNewPasswordType>;
    errors: FieldErrors<zodUserNewPasswordType>;
    placeholder: string;
    disabled?: boolean;
    type: string;
};

type InputAuthNotRegistered = {
    name: string;
    label: string;
    value: string;
    disabled?: boolean;
    type: string;
};

type InputAuthRegisterProps = {
    registerName: keyof zodUserRegisterType;
    label: string;
    register: UseFormRegister<zodUserRegisterType>;
    errors: FieldErrors<zodUserRegisterType>;
    placeholder: string;
    disabled?: boolean;
    type: string;
};

export function InputAuthLogin({
    registerName,
    label,
    register,
    errors,
    placeholder,
    disabled,
    type,
}: InputAuthLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="flex flex-col mb-4">
            <label
                htmlFor={registerName}
                className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    {...register(registerName)}
                    type={
                        type === "password"
                            ? showPassword
                                ? "text"
                                : "password"
                            : type
                    }
                    id={registerName}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-800 disabled:placeholder-gray-800 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-300 dark:disabled:placeholder-gray-300 "
                    disabled={disabled}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                        {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                )}
            </div>
            {errors[registerName] && (
                <span className="text-red-500 text-sm mt-2">
                    {errors[registerName]?.message}
                </span>
            )}
        </div>
    );
}

export function InputAuthRegister({
    registerName,
    label,
    register,
    errors,
    placeholder,
    disabled,
    type,
}: InputAuthRegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="flex flex-col mb-4">
            <label
                htmlFor={registerName}
                className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    {...register(registerName)}
                    type={
                        type === "password"
                            ? showPassword
                                ? "text"
                                : "password"
                            : type
                    }
                    id={registerName}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-800 disabled:placeholder-gray-800 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-300 dark:disabled:placeholder-gray-300 "
                    disabled={disabled}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                        {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                )}
            </div>
            {errors[registerName] && (
                <span className="text-red-500 text-sm mt-2">
                    {errors[registerName]?.message}
                </span>
            )}
        </div>
    );
}

export function InputAuthReset({
    registerName,
    label,
    register,
    errors,
    placeholder,
    disabled,
    type,
}: InputAuthResetProps) {
    return (
        <div className="flex flex-col mb-4">
            <label
                htmlFor={registerName}
                className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
                {label}
            </label>
            <input
                {...register(registerName)}
                type={type}
                id={registerName}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-800 disabled:placeholder-gray-800 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-300 dark:disabled:placeholder-gray-300 "
                disabled={disabled}
            />
            {errors[registerName] && (
                <span className="text-red-500 text-sm mt-2">
                    {errors[registerName]?.message}
                </span>
            )}
        </div>
    );
}

export function InputAuthNewPassword({
    registerName,
    label,
    register,
    errors,
    placeholder,
    disabled,
    type,
}: InputAuthNewPasswordProps) {
    return (
        <div className="flex flex-col mb-4">
            <label
                htmlFor={registerName}
                className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
                {label}
            </label>
            <input
                {...register(registerName)}
                type={type}
                id={registerName}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-800 disabled:placeholder-gray-800 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-300 dark:disabled:placeholder-gray-300 "
                disabled={disabled}
            />
            {errors[registerName] && (
                <span className="text-red-500 text-sm mt-2">
                    {errors[registerName]?.message}
                </span>
            )}
        </div>
    );
}

export function InputAuthNotRegistered ({
    name,
    label,
    value,
    disabled,
    type,
}: InputAuthNotRegistered) {
    return (
        <div className="flex flex-col mb-4">
            <label
                htmlFor={name}
                className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
                {label}
            </label>
            <input
                type={type}
                id={name}
                value={value}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-800 disabled:placeholder-gray-800 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-300 dark:disabled:placeholder-gray-300 "
                disabled={disabled}
            />
        </div>
    );
}