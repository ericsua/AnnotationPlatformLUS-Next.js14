import { ZodNumber, z } from "zod";

// converts the strings "true" and "false" to boolean values used for Zod fields since
// react-hook-form does sets radio button values as strings
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

// custom Zod pipe for input number fields since react-hook-form sets input number fields as strings
const zodInputNumberConverter = (zodPipe: ZodNumber) =>
    z
        .string()
        // if the value is an empty string, convert it to null
        .transform((value) => (value === "" ? null : value))
        .nullable()
        // refine is a Zod method that allows you to add custom validation logic (true = valid, false = invalid)
        .refine(
            // check that the value is not null and not NaN
            (value) =>
                value !== null || (value !== null && !isNaN(Number(value))),
            // custom error message if the refinement fails
            {
                message: "A number is required",
            }
        )
        // transform the string to a number, if the value is null, set it to 0
        .transform((value) => (value === null ? 0 : Number(value)))
        .pipe(zodPipe);

const requiredErrorMessage = { invalid_type_error: "Please select an option" };

// Zod schema for the form data (needs to be the updated with the form data in the backend)
// The front- and back-end schemas are not exactly the same, but they are similar, since the front-end has to
// convert values collected from the page to the correct types before sending them to the back-end
export const FormSchema = z.object({
    pleuralLine: z
        .object({
            // first applies the zod pipe to convert the string in the input field to a number, then normal zod validation
            depthInCentimeters: zodInputNumberConverter(
                z
                    .number({
                        // custom error message if the number is not valid, in all cases (min/max/step), the message is the same
                        errorMap: () => ({
                            message:
                                "The number must be between 0 and 1 and have at most one decimal",
                        }),
                    })
                    // check that the number is between 0 and 1, and has at most one decimal
                    .min(0)
                    .max(1)
                    .step(0.1)
                )
                .nullable() // since it is not used for now
                .default(null),
            isRegular: z
                // pass the custom error message to the zod field (for invalid_type_error)
                .string(requiredErrorMessage)
                // convert the string to a boolean
                .transform((val, ctx) => convertStringToBoolean(val, ctx)),
            // in general, "specifics" are fields required when a certain other field is set to a specific value (e.g. isRegular === false)
            specificsIrregular: z
                .object({
                    isContinuous: z
                        .string(requiredErrorMessage)
                        .transform((val, ctx) =>
                            convertStringToBoolean(val, ctx)
                        )
                        .nullable(),
                })
                .nullable() // in general, specifics are nullable, since they are only required in certain cases
                .default(null),
        })
        .refine(
            // check that the specifics are filled if the pleural line is set to irregular
            (data) => {
                return data.isRegular === false
                    ? data.specificsIrregular?.isContinuous !== null
                    : true;
            },
            {
                message:
                    "If the pleural line is irregular, the specifics must be filled",
                // path to the field that is invalid, relative to the root of the object,
                // to show the user where the error is
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
        // check that the specifics are filled if the horizontal artifacts are present
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
            // one refine for each field that is required if the micro-consolidations are present
            // refine are done in the parent object, since they are always present, but the specifics are not
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
                        z.enum(["complex", "hypo-anechoic"], requiredErrorMessage)
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

// infer the type of the Zod schema (final types after transformations are used) to use in the form (for react-hook-form)
export type FormData = z.infer<typeof FormSchema>;
// infer the type of the Zod schema (untransformed input types are used) to use in the form UI (for react-hook-form)
export type FormDataUI = z.input<typeof FormSchema>;

// type to get the keys of the object in a nested way (e.g. "pleuralLine.depthInCentimeters")
type NestedKeys<T> = T extends object
    ? {
          [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${NestedKeys<T[K]>}`}`;
      }[keyof T]
    : never;

// get the keys of the form data object in a nested way
export type RegisterName = NestedKeys<FormData>;