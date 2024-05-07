"use server"
import EmailVerification from "@/lib/emailVerification"
import React from "react"
import { Resend } from "resend"
import EmailResetPassword from "./emailResetPassword"

// Resend API client (a service to send emails, but needs full access to an authoritative DNS server and a domain)
const resend = new Resend(process.env.RESEND_API_KEY)

// Function to send the verification email with the Resend API
export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/new-verification?token=${token}`

    return await resend.emails.send({
        from: "Video Annotation Platform <onboarding@resend.dev>",
        to: email,
        reply_to: process.env.REPLY_TO_EMAIL,
        subject: "Verify your email",
        react: React.createElement(EmailVerification, { verificationLink: confirmLink }),
    })
}

// Function to send the password reset email with the Resend API
export const sendResetPasswordEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/new-password?token=${token}&email=${email}`

    return await resend.emails.send({
        from: "Video Annotation Platform <onboarding@resend.dev>",
        to: email,
        reply_to: process.env.REPLY_TO_EMAIL,
        subject: "Reset your password",
        react: React.createElement(EmailResetPassword, { resetLink: resetLink }),
    })
}