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
import { auth } from "@/auth";
import ButtonAuth from "@/components/ButtonAuth";
import { InputAuthRegister } from "@/components/InputAuth";
import TitleFormAuth from "@/components/TitleFormAuth";
import FormWrapperAuth from "@/components/FormWrapperAuth";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";
import { set } from "lodash";
import { registerUser } from "@/actions/register";

export default function RegisterPage() {
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

    async function onSubmit(data: zodUserRegisterType) {
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 1000 * 2)
        );
        console.log("registration to send", data);
        // const resPromise = fetch("/api/auth/register", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(data),
        // });

        // toast.promise(resPromise, {
        //     loading: "Sending data...",
        //     success: (data) => {if (!data.ok) throw new Error("Registration failed"); return "Registered successfully";},
        //     error: "Registration failed",
        // });
        // const res = await resPromise;
        // if (!res.ok) {
        //     try {
        //         const json = await res.json();
        //         console.log("register error", json);
        //         const { errors } = json;
        //         const errorsKeys = Object.keys(errors);
        //         errorsKeys.forEach((key) => {
        //             console.error(
        //                 key as keyof zodUserRegisterType,
        //                 errors[key]
        //             );
        //             setError(key as keyof zodUserRegisterType, {
        //                 type: "server",
        //                 message: errors[key],
        //             });
        //         });
        //         return;
        //     } catch (error) {
        //         console.error("registration error", error);
        //     }

        //     return;
        // }
        // console.log("register response", res);

        setErrorForm("");
        setSuccessForm("");

        const resPromise = registerUser(data)

        toast.promise(resPromise, {
            loading: "Sending data...",
            success: (data) => {if (!data.ok) throw new Error("Registration failed"); return "Registered successfully";},
            error: "Registration failed",
        }, {position: "top-center"});
        const res = await resPromise;
        console.log("res", res);
        setErrorForm(res.error);
        setSuccessForm(res.success);
        if (!res.ok) {
            try {
                const errors: any = res.errors;
                if (!errors) return;
                console.log("register error", res);
                const errorsKeys = Object.keys(errors);
                errorsKeys.forEach((key) => {
                    console.error(
                        key as keyof zodUserRegisterType,
                        errors[key]
                    );
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
        reset();
        console.log("register response", res);

        
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
