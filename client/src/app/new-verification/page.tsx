"use client";
import { newVerification } from "@/actions/new-verification";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { SyncLoader, BeatLoader } from "react-spinners";

// Page to confirm the verification of the email
export default function NewVerificationPage() {
    // Get the token from the URL, since it was set in the verification email
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    // Submit the form to verify the email
    const onSubmit = useCallback(() => {
        if (success || error) return;
        // Artificial delay 
        const wait = new Promise((resolve) =>
            setTimeout(() => resolve(null), 1000)
        );
        wait.then(() => {
            if (!token) {
                setError("No token provided");
                return;
            }
            // Complete verification of the email in the server
            newVerification(token)
                .then((data) => {
                    setSuccess(data.success);
                    setError(data.error);
                })
                .catch((error) => {
                    setError("Something went wrong");
                });
        });
    }, [token, success, error]);

    // Run the onSubmit function when the page loads
    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <>
            <div className="h-screen w-full flex flex-col items-center justify-center">
                <div className="border-[1px] rounded border-slate-400 dark:border-slate-500">
                    <div className="p-8 w-96 flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-bold mb-4">
                            Email Verification
                        </h1>
                        {!success && !error && (
                            <SyncLoader color="gray" loading={true} />
                        )}
                        <FormError message={error} />
                        {!error && <FormSuccess message={success} />}
                        {(success || error) && (
                            <span className="mt-4">
                                Go back to{" "}
                                <a
                                    href="/login"
                                    className="text-blue-500 hover:text-blue-700 hover:underline"
                                >
                                    Login
                                </a>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
