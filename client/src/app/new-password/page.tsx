"use client"
import { newPassword } from "@/actions/new-password";
import ButtonAuth from "@/components/ButtonAuth";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { InputAuthNewPassword, InputAuthNotRegistered } from "@/components/InputAuth";
import { zodUserNewPasswordSchema, zodUserNewPasswordType } from "@/types/Authentication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";

// Page to reset the password
export default function NewPasswordPage() {
    // Get the token and email from the URL, since they were set in the reset password email
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // Form for the reset password process
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset
    } = useForm<zodUserNewPasswordType>({
        resolver: zodResolver(zodUserNewPasswordSchema),
    });
    const [success, setSuccessForm] = useState<string | undefined>();
    const [error, setErrorForm] = useState<string | undefined>();

    // Submit the form to reset the password
    const onSubmit = async (data: zodUserNewPasswordType) => {
        // console.log(data);

        // Reset the success and error messages
        setSuccessForm(undefined);
        setErrorForm(undefined);

        // Send the data to the server (no await here, the toaster and later the setSuccess/setError will handle the response)
        const resPromise = newPassword(data, token)

        toast.promise(
            resPromise,
            {
                loading: "Sending data...",
                success: (data) => {
                    // function to run when the promise resolves, as a custom way to check if everything went well
                    if (!data.ok) throw new Error(data.error);
                    return "Success!";
                },
                error: "Something went wrong!",
            },
            { position: "top-center" }
        );

        const res = await resPromise;
        // Show the success or error messages from the server, if needed
        setSuccessForm(res?.success);
        setErrorForm(res?.error);

        // Show the server errors related to Zod validation on the form
        if (res?.errors) {
            const errors: any = res.errors;
            Object.keys(errors).forEach((key) => {
                setError(key as keyof zodUserNewPasswordType, {
                    type: "server",
                    message: errors[key],
                });
            });
        }
        // Reset the form
        reset()
    };

    return (
        <>
            <div className="h-screen w-full flex flex-col items-center justify-center p-2">
                <div className="border-[1px] w-full max-w-md rounded border-slate-400 dark:border-slate-500">
                    <div className="p-8 w-full flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-bold mb-8">
                            Forgot Your Password?
                        </h1>
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                            <InputAuthNotRegistered
                                name="email"
                                label="Email"
                                value={email || ""}
                                type="email"
                                disabled={true}/>

                            <InputAuthNewPassword
                                register={register}
                                registerName="password"
                                type="password"
                                label="New password"
                                placeholder="Insert your new password"
                                errors={errors}
                                disabled={isSubmitting}
                            />
                            <InputAuthNewPassword
                                register={register}
                                registerName="confirmPassword"
                                type="password"
                                label="Confirm password"
                                placeholder="Confirm your new password"
                                errors={errors}
                                disabled={isSubmitting}
                            />
                            <FormSuccess message={success} />
                            <FormError message={error} />
                            {/* Show a loading spinner while the form is submitting */}
                            {isSubmitting && (
                                <div className="mx-auto w-fit mt-8">
                                    <SyncLoader color="gray" loading={true} />
                                </div>
                            )}
                            <ButtonAuth
                                isSubmitting={isSubmitting}
                                label="Change password"
                            />
                            
                            <div className="mt-8 w-fit mx-auto">
                                Go back to{" "}
                                <a
                                    href="/login"
                                    className="text-blue-500 hover:text-blue-700 hover:underline"
                                >
                                    Login
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>)
}
