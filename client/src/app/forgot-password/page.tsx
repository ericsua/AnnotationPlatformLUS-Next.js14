"use client";
import { forgotPassword } from "@/actions/forgotPassword";
import ButtonAuth from "@/components/ButtonAuth";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { InputAuthReset } from "@/components/InputAuth";
import { zodUserResetSchema, zodUserResetType } from "@/types/Authentication";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";

// Page to reset the password
export default function ForgotPassword() {
    // Form for the reset password process
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<zodUserResetType>({
        resolver: zodResolver(zodUserResetSchema),
    });
    const [success, setSuccess] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();

    // Submit the form to reset the password
    const onSubmit = async (data: zodUserResetType) => {
        // console.log(data);

        // Hide the success and error messages
        setSuccess(undefined);
        setError(undefined);

        // Send the data to the server (no await here, the toaster and later the setSuccess/setError will handle the response)
        const resPromise = forgotPassword(data);

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
        setSuccess(res?.success);
        setError(res?.error);
        if (res.error) {
            throw new Error(res.error);
        }
    };

    return (
        <>
            <div className="h-screen w-full flex flex-col items-center justify-center">
                <div className="border-[1px] w-full max-w-sm rounded border-slate-400 dark:border-slate-500">
                    <div className="p-8 w-full flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-bold mb-8">
                            Forgot Your Password?
                        </h1>
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                            <InputAuthReset
                                register={register}
                                registerName="email"
                                type="email"
                                label="Email"
                                placeholder="Insert your email here"
                                errors={errors}
                                disabled={isSubmitting || isSubmitSuccessful}
                            />
                            <FormSuccess message={success} />
                            <FormError message={error} />
                            {isSubmitting && (
                                <div className="mx-auto w-fit mt-8">
                                    <SyncLoader color="gray" loading={true} />
                                </div>
                            )}
                            <ButtonAuth
                                isSubmitting={isSubmitting || isSubmitSuccessful}
                                label="Send reset email"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
