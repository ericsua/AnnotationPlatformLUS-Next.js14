import React from "react";

import {
    Html,
    Body,
    Head,
    Heading,
    Hr,
    Container,
    Preview,
    Section,
    Text,
    Button,
} from "@react-email/components";

import { Tailwind } from "@react-email/tailwind";

export default function EmailVerification({
    verificationLink,
}: {
    verificationLink: string;
}) {
    return (
        <Html>
            <Head />
            <Preview>Verify your account</Preview>
            <Tailwind>
                <Body className="font-[Inter] bg-gray-100">
                    <Container className="p-8">
                        <Section className="mb-4">
                            <Heading className="text-2xl font-bold text-gray-800">
                                Video Annotation Platform
                            </Heading>
                            <Text className="mt-2 text-gray-600">
                                Click the link below to verify your account.
                            </Text>
                            <Button
                                className="mx-auto block w-fit cursor-pointer hover:bg-blue-700 mt-4 bg-blue-500 text-white rounded px-4 py-2 my-8"
                                href={verificationLink}
                            >
                                Verify your account
                            </Button>
                        </Section>
                        <Section>
                            <Text className="text-gray-600 text-sm">
                                If you did not create an account, no further
                                action is required.
                            </Text>
                        </Section>
                        <Hr className="my-8" />
                        <Section>
                            <Text className="text-gray-600 text-xs">
                                This email was sent to you because you signed up
                                for an account on the Video Annotation Platform.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
