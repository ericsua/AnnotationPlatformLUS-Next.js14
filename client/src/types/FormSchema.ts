import { ZodNumber, z } from "zod";

function convertStringToBoolean(value: string, ctx: z.RefinementCtx) {
    if (value !== "true" && value !== "false") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid value",
        });
        return z.NEVER;
    }
    return value === "true";
}

const zodInputNumberConverter = (zodPipe: ZodNumber) =>
    z
        .string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .refine(
            (value) =>
                value !== null || (value !== null && !isNaN(Number(value))),
            {
                message: "A number is required",
            }
        )
        .transform((value) => (value === null ? 0 : Number(value)))
        .pipe(zodPipe);

const requiredErrorMessage = { invalid_type_error: "Please select an option" };

export const FormSchema = z.object({
    pleuralLine: z
        .object({
            depthInCentimeters: zodInputNumberConverter(
                z
                    .number({
                        errorMap: () => ({
                            message:
                                "The number must be between 0 and 1 and have at most one decimal",
                        }),
                    })
                    .min(0)
                    .max(1)
                    .step(0.1)
            )
                .nullable()
                .default(null),
            isRegular: z
                .string(requiredErrorMessage)
                .transform((val, ctx) => convertStringToBoolean(val, ctx)),
            specificsIrregular: z
                .object({
                    isContinuous: z
                        .string(requiredErrorMessage)
                        .transform((val, ctx) =>
                            convertStringToBoolean(val, ctx)
                        )
                        .nullable(),
                })
                .nullable()
                .default(null),
        })
        .refine(
            (data) => {
                return data.isRegular === false
                    ? data.specificsIrregular?.isContinuous !== null
                    : true;
            },
            {
                message:
                    "If the pleural line is irregular, the specifics must be filled",
                path: ["specificsIrregular.isContinuous"],
            }
        ),
    axisScan: z.enum(["longitudinal", "horizontal"], requiredErrorMessage),
    isPleuralSlidingPresent: z
        .string(requiredErrorMessage)
        .transform((val, ctx) => convertStringToBoolean(val, ctx)),
    horizontalArtifacts: z
        .object({
            isPresent: z
                .string(requiredErrorMessage)
                .transform((val, ctx) => convertStringToBoolean(val, ctx)),
            specifics: z
                .object({
                    coverageAboveOrEqual50: z
                        .string(requiredErrorMessage)
                        .transform((val, ctx) =>
                            convertStringToBoolean(val, ctx)
                        )
                        .nullable(),
                })
                .nullable()
                .default(null),
        })
        .refine(
            (data) => {
                return data.isPresent === true
                    ? data.specifics?.coverageAboveOrEqual50 !== null
                    : true;
            },
            {
                message:
                    "If the horizontal artifacts are present, the specifics must be filled",
                path: ["specifics.coverageAboveOrEqual50"],
            }
        ),
    verticalArtifacts: z
        .object({
            isPresent: z
                .string(requiredErrorMessage)
                .transform((val, ctx) => convertStringToBoolean(val, ctx)),
            specifics: z
                .object({
                    coverageAboveOrEqual50: z
                        .string(requiredErrorMessage)
                        .transform((val, ctx) =>
                            convertStringToBoolean(val, ctx)
                        )
                        .nullable(),
                })
                .nullable()
                .default(null),
        })
        .refine(
            (data) => {
                return data.isPresent === true
                    ? data.specifics?.coverageAboveOrEqual50 !== null
                    : true;
            },
            {
                message:
                    "If the vertical artifacts are present, the specifics must be filled",
                path: ["specifics.coverageAboveOrEqual50"],
            }
        ),
    subpleuralSpace: z.object({
        microConsolidations: z
            .object({
                isPresent: z
                    .string(requiredErrorMessage)
                    .transform((val, ctx) => convertStringToBoolean(val, ctx)),
                specifics: z
                    .object({
                        isSingle: z
                            .string(requiredErrorMessage)
                            .transform((val, ctx) =>
                                convertStringToBoolean(val, ctx)
                            )
                            .nullable(),
                        coverageAboveOrEqual50: z
                            .string(requiredErrorMessage)
                            .transform((val, ctx) =>
                                convertStringToBoolean(val, ctx)
                            )
                            .nullable(),
                    })
                    .nullable()
                    .default(null),
            })
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.coverageAboveOrEqual50 !== null
                        : true;
                },
                {
                    message:
                        "If the micro-consolidations are present, the specifics must be filled",
                    path: ["specifics.coverageAboveOrEqual50"],
                }
            )
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.isSingle !== null
                        : true;
                },
                {
                    message:
                        "If the micro-consolidations are present, the specifics must be filled",
                    path: ["specifics.isSingle"],
                }
            ),
        macroConsolidations: z
            .object({
                isPresent: z
                    .string(requiredErrorMessage)
                    .transform((val, ctx) => convertStringToBoolean(val, ctx)),
                specifics: z
                    .object({
                        isSingle: z
                            .string(requiredErrorMessage)
                            .transform((val, ctx) =>
                                convertStringToBoolean(val, ctx)
                            )
                            .nullable(),
                        coverageAboveOrEqual50: z
                            .string()
                            .transform((val, ctx) =>
                                convertStringToBoolean(val, ctx)
                            )
                            .nullable(),
                        airBronchogram: z
                            .object({
                                isPresent: z
                                    .string(requiredErrorMessage)
                                    .transform((val, ctx) =>
                                        convertStringToBoolean(val, ctx)
                                    )
                                    .nullable(),
                                specifics: z
                                    .object({
                                        isStatic: z
                                            .string(requiredErrorMessage)
                                            .transform((val, ctx) =>
                                                convertStringToBoolean(val, ctx)
                                            )
                                            .nullable(),
                                        isFluid: z
                                            .string(requiredErrorMessage)
                                            .transform((val, ctx) =>
                                                convertStringToBoolean(val, ctx)
                                            )
                                            .nullable(),
                                    })
                                    .nullable()
                                    .default(null),
                            })
                            .nullable()
                            .default(null),
                        dopplerData: z.object({
                            isAvailable: z
                                .string(requiredErrorMessage)
                                .transform((val, ctx) =>
                                    convertStringToBoolean(val, ctx)
                                )
                                .nullable(),
                            specifics: z
                                .object({
                                    isVascularizationPresent: z
                                        .string(requiredErrorMessage)
                                        .transform((val, ctx) =>
                                            convertStringToBoolean(val, ctx)
                                        )
                                        .nullable(),
                                    isCoherentWithAnatomy: z
                                        .string(requiredErrorMessage)
                                        .transform((val, ctx) =>
                                            convertStringToBoolean(val, ctx)
                                        )
                                        .nullable(),
                                })
                                .nullable()
                                .default(null),
                        }),
                    })
                    .nullable()
                    .default(null),
            })
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.isSingle !== null
                        : true;
                },
                {
                    message:
                        "If the macro-consolidations are present, the specifics must be filled",
                    path: ["specifics.isSingle"],
                }
            )
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.coverageAboveOrEqual50 !== null
                        : true;
                },
                {
                    message:
                        "If the macro-consolidations are present, the specifics must be filled",
                    path: ["specifics.coverageAboveOrEqual50"],
                }
            )
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.airBronchogram?.isPresent !== null
                        : true;
                },
                {
                    message:
                        "If the macro-consolidations are present, the specifics must be filled",
                    path: ["specifics.airBronchogram.isPresent"],
                }
            )
            .refine(
                (data) => {
                    return data.isPresent === true
                        ? data.specifics?.dopplerData.isAvailable !== null
                        : true;
                },
                {
                    message:
                        "If the macro-consolidations are present, the specifics must be filled",
                    path: ["specifics.dopplerData.isAvailable"],
                }
            )
            .refine(
                (data) => {
                    return data.specifics?.airBronchogram?.isPresent === true
                        ? data.specifics.airBronchogram.specifics?.isStatic !==
                              null
                        : true;
                },
                {
                    message:
                        "If the air bronchogram is present, the specifics must be filled",
                    path: ["specifics.airBronchogram.specifics.isStatic"],
                }
            )
            .refine(
                (data) => {
                    return data.specifics?.airBronchogram?.isPresent === true
                        ? data.specifics.airBronchogram.specifics?.isFluid !==
                              null
                        : true;
                },
                {
                    message:
                        "If the air bronchogram is present, the specifics must be filled",
                    path: ["specifics.airBronchogram.specifics.isFluid"],
                }
            )
            .refine(
                (data) => {
                    return data.specifics?.dopplerData?.isAvailable === true
                        ? data.specifics.dopplerData.specifics
                              ?.isVascularizationPresent !== null
                        : true;
                },
                {
                    message:
                        "If the Doppler data is available, the specifics must be filled",
                    path: [
                        "specifics.dopplerData.specifics.isVascularizationPresent",
                    ],
                }
            )
            .refine(
                (data) => {
                    return data.specifics?.dopplerData?.isAvailable === true
                        ? data.specifics.dopplerData.specifics
                              ?.isCoherentWithAnatomy !== null
                        : true;
                },
                {
                    message:
                        "If the Doppler data is available, the specifics must be filled",
                    path: [
                        "specifics.dopplerData.specifics.isCoherentWithAnatomy",
                    ],
                }
            ),
    }),
    pleuralEffusion: z
        .object({
            isPresent: z
                .string(requiredErrorMessage)
                .transform((val) => val === "true"),
            specifics: z
                .object({
                    characterization: 
                        z.enum(["complex", "ipo-anechoic"], requiredErrorMessage)
                        .nullable(),
                    isSeptaPresent: z
                        .string(requiredErrorMessage)
                        .transform((val) => val === "true")
                        .nullable(),
                })
                .nullable()
                .default(null),
        })
        .refine(
            (data) => {
                return data.isPresent === true
                    ? data.specifics?.characterization !== null
                    : true;
            },
            {
                message:
                    "If the pleural effusion is present, the specifics must be filled",
                path: ["specifics.characterization"],
            }
        )
        .refine(
            (data) => {
                return data.isPresent === true
                    ? data.specifics?.isSeptaPresent !== null
                    : true;
            },
            {
                message:
                    "If the pleural effusion is present, the specifics must be filled",
                path: ["specifics.isSeptaPresent"],
            }
        ),
    textDescription: z.string(requiredErrorMessage).min(50, {
        message: "The description must be at least 50 characters long",
    }),
    confidence: z.enum(["low", "medium", "high"], requiredErrorMessage),
});

export type FormData = z.infer<typeof FormSchema>;
export type FormDataUI = z.input<typeof FormSchema>;

type NestedKeys<T> = T extends object
    ? {
          [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${NestedKeys<T[K]>}`}`;
      }[keyof T]
    : never;

export type RegisterName = NestedKeys<FormData>;