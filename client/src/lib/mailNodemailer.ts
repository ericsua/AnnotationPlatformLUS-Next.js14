"use server"
import EmailVerification from "@/lib/emailVerification"
import React from "react"
import EmailResetPassword from "./emailResetPassword"
import nodemailer from "nodemailer"
import { render } from "@react-email/render"

// Nodemailer transport to send emails through a Gmail account (needs a custom Password App in the Gmail settings under "Security" and "two-step verification")
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
    secure: true, // use SSL
})

// Verify the connection configuration to the Gmail server
try {
    const verify = transport.verify().then(() => {
        // console.log("Nodemailer: connected")
    }).catch((error) => {
        console.log("Nodemailer: cannot connect", error)
    })
} catch (error) {
    console.log("Nodemailer: cannot connect", error)
}

// Function to send the verification email with Nodemailer
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

// Function to send the password reset email with Nodemailer
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