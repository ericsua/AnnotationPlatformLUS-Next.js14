"use server"
import EmailVerification from "@/lib/emailVerification"
import React from "react"
import { Resend } from "resend"
import EmailResetPassword from "./emailResetPassword"
import nodemailer from "nodemailer"
import { render } from "@react-email/render"

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
})

try {
    const verify = transport.verify()
    console.log(verify)
} catch (error) {
    console.log(error)
}

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/new-verification?token=${token}`

    return await transport.sendMail({
        from: {
            name: "Video Annotation Platform",
            address: process.env.SMTP_EMAIL as string
        },
        to: email,
        replyTo: process.env.REPLY_TO_EMAIL,
        subject: "Verify your email",
        html: render(React.createElement(EmailVerification, { verificationLink: confirmLink })),
    })
}

export const sendResetPasswordEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/new-password?token=${token}&email=${email}`

    return await transport.sendMail({
        from: {
            name: "Video Annotation Platform",
            address: process.env.SMTP_EMAIL as string
        },
        to: email,
        replyTo: process.env.REPLY_TO_EMAIL,
        subject: "Reset your password",
        html: render(React.createElement(EmailResetPassword, { resetLink: resetLink })),
    })
}