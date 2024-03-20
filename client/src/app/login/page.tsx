"use client";
import Navbar from "@/components/Navbar";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodUserLoginSchema, zodUserLoginType } from "@/types/Authentication";
import toast from "react-hot-toast";
import { loginUser } from "@/actions/login";
import { getSession, useSession } from "next-auth/react";
import { InputAuthLogin } from "@/components/InputAuth";
import ButtonAuth from "@/components/ButtonAuth";
import FormWrapperAuth from "@/components/FormWrapperAuth";
import TitleFormAuth from "@/components/TitleFormAuth";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset
    } = useForm<zodUserLoginType>({
        resolver: zodResolver(zodUserLoginSchema),
    });

    const session = useSession();

    const router = useRouter();

    const [errorForm, setErrorForm] = useState<string | undefined>("");
    const [successForm, setSuccessForm] = useState<string | undefined>("");

    const onSubmit = async (data: zodUserLoginType) => {
        setSuccessForm("");
        setErrorForm("");

        const resPromise = loginUser(data);

        //console.log("resPromise", resPromise);

        toast.promise(resPromise, {
            loading: "Sending data...",
            success: (data) => {
                if (!data.ok) throw new Error("Login failed");
                return "Login successful!";
            },
            error: "Login failed",
        }, {position: "top-center"});
        const { status, message, error, success, ok } = await resPromise;
        setSuccessForm(success);
        setErrorForm(error);
        console.log("status", status, message);
        await getSession();
        if (!ok) {
            return;
        }
        console.log("login response", message);
        reset();

        await new Promise((resolve) => {
            toast.loading("Redirecting...", {
                position: "top-center",
                duration: 1000,
            });
            setTimeout(() => {
                router.push("/");
                resolve(null);
            }, 1000);
        });
    };

    return (
        <>
            <div className="flex flex-col w-[1280px] mx-auto justify-center h-svh px-4">
                <Navbar />
                <FormWrapperAuth>
                    <TitleFormAuth title="Login" />
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <InputAuthLogin
                            type="email"
                            registerName="email"
                            label="Email"
                            register={register}
                            errors={errors}
                            placeholder="Insert your email"
                            disabled={isSubmitting}
                        />
                        <InputAuthLogin
                            type="password"
                            registerName="password"
                            label="Password"
                            register={register}
                            errors={errors}
                            placeholder="Insert your password"
                            disabled={isSubmitting}
                        />
                        <FormSuccess message={successForm} />
                        <FormError message={errorForm} />
                        <ButtonAuth isSubmitting={isSubmitting} label="Login" />
                        <div className="flex items-center justify-between mt-8">
                            <div className="text-sm">
                                <span className="">
                                    Don't have an account?{" "}
                                </span>
                                <Link
                                    href="/register"
                                    className="font-semibold text-blue-500 hover:underline"
                                >
                                    Register
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
