"use client";
import Navbar from "@/components/Navbar";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    zodUserRegisterSchema,
    zodUserRegisterType,
} from "@/types/Authentication";
import toast from "react-hot-toast";
import ButtonAuth from "@/components/ButtonAuth";
import { InputAuthRegister } from "@/components/InputAuth";
import TitleFormAuth from "@/components/TitleFormAuth";
import FormWrapperAuth from "@/components/FormWrapperAuth";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";
import { registerUser } from "@/actions/register";

// Page to register a new user
export default function RegisterPage() {
    // Form for the registration process
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset
    } = useForm<zodUserRegisterType>({
        resolver: zodResolver(zodUserRegisterSchema),
    });

    const [errorForm, setErrorForm] = useState<string | undefined>("");
    const [successForm, setSuccessForm] = useState<string | undefined>("");

    // Submit the form to register a new user
    async function onSubmit(data: zodUserRegisterType) {
        // Artificial delay for security reasons and to show the loading spinner
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 1000 * 2)
        );
        // console.log("registration to send", data);

        // Reset the success and error messages
        setErrorForm("");
        setSuccessForm("");

        // Send the data to the server (no await here, the toaster and later the setSuccess/setError will handle the response)
        const resPromise = registerUser(data)

        toast.promise(resPromise, {
            loading: "Sending data...",
            success: (data) => {
                // function to run when the promise resolves, as a custom way to check if everything went well
                if (!data.ok)
                    throw new Error("Registration failed"); 
                return "Registered successfully";
            },
            error: "Registration failed",
        }, {position: "top-center"});

        // Wait for the response to finish
        const res = await resPromise;
        // console.log("res", res);
        // Set the success and error messages from the server, if any
        setErrorForm(res.error);
        setSuccessForm(res.success);

        // If there are errors (Zod valudation or server errors), set them in the form fields
        if (!res.ok) {
            try {
                const errors: any = res.errors;
                if (!errors) return;
                // console.log("register error", res);
                const errorsKeys = Object.keys(errors);
                // Set Zod validation errors in the form fields
                errorsKeys.forEach((key) => {
                    // console.error(
                    //     key as keyof zodUserRegisterType,
                    //     errors[key]
                    // );
                    setError(key as keyof zodUserRegisterType, {
                        type: "server",
                        message: errors[key],
                    });
                });
                return;
            } catch (error) {
                console.error("registration error", error);
            }

            return;
        }
        // Reset the form
        reset();
        // console.log("register response", res);

        
    }

    return (
        <>
            <div className="flex flex-col w-[1280px] mx-auto justify-center h-svh px-4">
                <Navbar />
                <FormWrapperAuth>
                            <TitleFormAuth title="Register" />
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="w-full"
                            >
                                <InputAuthRegister
                                    type="email"
                                    register={register}
                                    registerName="email"
                                    label="Email"
                                    errors={errors}
                                    placeholder="Insert your email"
                                    disabled={isSubmitting}

                                />
                                <InputAuthRegister
                                    type="password"
                                    register={register}
                                    registerName="password"
                                    label="Password"
                                    errors={errors}
                                    placeholder="Insert your password"
                                    disabled={isSubmitting}

                                />
                                <InputAuthRegister
                                    type="password"
                                    register={register}
                                    registerName="confirmPassword"
                                    label="Confirm Password"
                                    errors={errors}
                                    placeholder="Confirm your password"
                                    disabled={isSubmitting}
                                />
                                <FormSuccess message={successForm}/>
                                <FormError message={errorForm}/>
                                <ButtonAuth
                                    isSubmitting={isSubmitting}
                                    label="Register"
                                />
                                <div className="flex items-center justify-between mt-8">
                                <div className="text-sm">
                                <span className="">
                                    Already have an account?{" "}
                                </span>
                                <Link
                                    href="/login"
                                    className="font-semibold text-blue-500 hover:underline"
                                >
                                    Login
                                </Link>
                            </div>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-semibold text-blue-500 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </form>
                            </FormWrapperAuth>
                        </div>
        </>
    );
}
