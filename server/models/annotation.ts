import mongoose from "mongoose";
import { z } from "zod";

// Schema for the annotations of the videos in the database
const Schema = mongoose.Schema;

const requiredErrorMessage = {invalid_type_error: "Please select an option"};

// Form schema for the annotation form with Zod validation
// This schema is very similar to the one in the client, but with some differences since it doesn't need to transform UI data like the client does
// Should be kept in sync with the client schema to avoid bugs, so any changes to the schema in the client should be reflected here
export const FormSchema = z.object({
    // First check if the quality is sufficient, otherwise the data are not required (skip button)
    isQualitySufficient: z.boolean(requiredErrorMessage),
    data: z.object({
        pleuralLine: z.object({
            depthInCentimeters: z.number({errorMap: () => ({message: "The number must be between 0 and 1 and have at most one decimal"})}).min(0).max(1).step(0.1).nullable().default(null),
            isRegular: z.boolean(requiredErrorMessage),
            specificsIrregular: z.object({
                isContinuous: z.boolean(requiredErrorMessage).nullable(),
            // in general, the specifics are nullable and default to null, since they are only required if the parent field is set to a certain value
            }).nullable().default(null),
        // Refine is used to add custom validation logic to the schema, in this case, it checks if the specifics are filled if the pleural line is irregular
        // as a way to ensure that the user doesn't forget to fill the specifics when some fields are set to a certain value
        }).refine((data) => { return data.isRegular === false ? data.specificsIrregular?.isContinuous !== null : true }, { message: "If the pleural line is irregular, the specifics must be filled", path: ["specificsIrregular.isContinuous"]}),
        axisScan: z.enum(["longitudinal", "horizontal"], requiredErrorMessage),
        isPleuralSlidingPresent: z.boolean(requiredErrorMessage),
        horizontalArtifacts: z.object({
            isPresent: z.boolean(requiredErrorMessage),
            specifics: z.object({
                coverageAboveOrEqual50: z.boolean(requiredErrorMessage).nullable(),
            }).nullable().default(null),
        }).refine((data) => { return data.isPresent === true ? data.specifics?.coverageAboveOrEqual50 !== null : true }, { message: "If the horizontal artifacts are present, the specifics must be filled", path: ["specifics.coverageAboveOrEqual50"]}),
        verticalArtifacts: z.object({
            isPresent: z.boolean(requiredErrorMessage),
            specifics: z.object({
                coverageAboveOrEqual50: z.boolean(requiredErrorMessage).nullable(),
            }).nullable().default(null),
        }).refine((data) => { return data.isPresent === true ? data.specifics?.coverageAboveOrEqual50 !== null : true }, { message: "If the vertical artifacts are present, the specifics must be filled", path: ["specifics.coverageAboveOrEqual50"]}),
        subpleuralSpace: z.object({
            microConsolidations: z.object({
                isPresent: z.boolean(requiredErrorMessage),
                specifics: z.object({
                    isSingle: z.boolean(requiredErrorMessage).nullable(),
                    coverageAboveOrEqual50: z.boolean(requiredErrorMessage).nullable(),
                }).nullable().default(null),
            }).refine((data) => { return data.isPresent === true ? data.specifics?.coverageAboveOrEqual50 !== null : true }, { message: "If the micro-consolidations are present, the specifics must be filled", path: ["specifics.coverageAboveOrEqual50"]})
            .refine((data) => { return data.isPresent === true ? data.specifics?.isSingle !== null : true }, { message: "If the micro-consolidations are present, the specifics must be filled", path: ["specifics.isSingle"]}),
            macroConsolidations: z.object({
                isPresent: z.boolean(requiredErrorMessage),
                specifics: z.object({
                    isSingle: z.boolean(requiredErrorMessage).nullable(),
                    coverageAboveOrEqual50: z.boolean().nullable(),
                    airBronchogram: z.object({
                        isPresent: z.boolean(requiredErrorMessage).nullable(),
                        specifics: z.object({
                            isStatic: z.boolean(requiredErrorMessage).nullable(),
                            isFluid: z.boolean(requiredErrorMessage).nullable(),
                        }).nullable().default(null),
                    }).nullable().default(null),
                    dopplerData: z.object({
                        isAvailable: z.boolean(requiredErrorMessage).nullable(),
                        specifics: z.object({
                            isVascularizationPresent: z.boolean(requiredErrorMessage).nullable(),
                            isCoherentWithAnatomy: z.boolean(requiredErrorMessage).nullable(),
                        }).nullable().default(null)
                    }).nullable().default(null),
                }).nullable().default(null),
            }).refine((data) => { return (data.isPresent === true ? data.specifics?.isSingle !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.isSingle"]})
            .refine((data) => { return (data.isPresent === true ? data.specifics?.coverageAboveOrEqual50 !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.coverageAboveOrEqual50"]})
            .refine((data) => { return (data.isPresent === true ? data.specifics?.airBronchogram?.isPresent !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.airBronchogram.isPresent"]})
            .refine((data) => { return (data.isPresent === true ? data.specifics?.dopplerData?.isAvailable !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.dopplerData.isAvailable"]})
            .refine((data) => { return (data.specifics?.airBronchogram?.isPresent === true ? data.specifics.airBronchogram.specifics?.isStatic !== null : true)}, { message: "If the air bronchogram is present, the specifics must be filled", path: ["specifics.airBronchogram.specifics.isStatic"]})
            .refine((data) => { return (data.specifics?.airBronchogram?.isPresent === true ? data.specifics.airBronchogram.specifics?.isFluid !== null : true)}, { message: "If the air bronchogram is present, the specifics must be filled", path: ["specifics.airBronchogram.specifics.isFluid"]})
            .refine((data) => { return (data.specifics?.dopplerData?.isAvailable === true ? data.specifics.dopplerData.specifics?.isVascularizationPresent !== null : true)}, { message: "If the Doppler data is available, the specifics must be filled", path: ["specifics.dopplerData.specifics.isVascularizationPresent"]})
            .refine((data) => { return (data.specifics?.dopplerData?.isAvailable === true ? data.specifics.dopplerData.specifics?.isCoherentWithAnatomy !== null : true)}, { message: "If the Doppler data is available, the specifics must be filled", path: ["specifics.dopplerData.specifics.isCoherentWithAnatomy"]}),
        }),
        pleuralEffusion: z.object({
            isPresent: z.boolean(requiredErrorMessage),
            specifics: z.object({
                characterization: z.enum(["complex", "hypo-anechoic"], requiredErrorMessage).nullable(),
                isSeptaPresent: z.boolean(requiredErrorMessage).nullable(),
            }).nullable().default(null),
        }).refine((data) => { return data.isPresent === true ? data.specifics?.characterization !== null : true }, { message: "If the pleural effusion is present, the specifics must be filled", path: ["specifics.characterization"]})
        .refine((data) => { return data.isPresent === true ? data.specifics?.isSeptaPresent !== null : true }, { message: "If the pleural effusion is present, the specifics must be filled", path: ["specifics.isSeptaPresent"]}),
    }).nullable().default(null),
    textDescription: z.string(requiredErrorMessage).min(50, {message: "The description must be at least 50 characters long"}),
    confidence: z.enum(["low", "medium", "high"], requiredErrorMessage),
})// check that the data is filled if the quality is sufficient (isQualitySufficient === true)
.refine((data) => {
    return data.isQualitySufficient === true ? data.data !== null : true;
    }, {
        message: "The data must be filled if the quality is sufficient",
        path: ["isQualitySufficient"]
    }
);

// Infer the type of the form data from the schema
export type FormData = z.infer<typeof FormSchema>;

// Type for the annotation data, including the video ID and the date
export type AnnotationData ={videoId: string, date: Date, annotations: FormData};

// Mongoose schema for the annotations
const annotationSchema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: "Videos", required: true },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    annotations: {
        isQualitySufficient: { type: Boolean, required: true },
        data: {
            pleuralLine: {
                // Not used for now
                depthInCentimeters: {
                    type: Number,
                    required: false,
                    checkMinMax: function (val: number) {
                        return val >= 0 && val <= 1;
                    },
                },
                isRegular: { type: Boolean, required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;} },
                specificsIrregular: {
                        isContinuous: {
                            type: Boolean,
                            // Required if the pleural line is irregular, "this" refers to the global object of the schema
                            required: function (this: AnnotationData) {
                                return this.annotations.data?.pleuralLine.isRegular === false;
                            },
                        },
                },
            },
            axisScan: {
                type: String,
                enum: ["longitudinal", "horizontal"],
                required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
            },
            isPleuralSlidingPresent: {
                type: Boolean,
                required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
            },
            horizontalArtifacts: {
                isPresent: {
                    type: Boolean,
                    required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
                },
                specifics: {
                    coverageAboveOrEqual50: {
                        type: Boolean,
                        required: function (this: AnnotationData) {
                            return this.annotations.data?.horizontalArtifacts.isPresent === true;
                        },
                    },
                },
            },
            verticalArtifacts: {
                isPresent: {
                    type: Boolean,
                    required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
                },
                specifics: {
                    coverageAboveOrEqual50: {
                        type: Boolean,
                        required: function (this: AnnotationData) {
                            this.annotations.data?.verticalArtifacts.isPresent === true;
                        }
                    },
                },
            },
            subpleuralSpace: {
                microConsolidations: {
                    isPresent: {
                        type: Boolean,
                        required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
                    },
                    specifics: {
                            isSingle: {
                                type: Boolean,
                                required: function (this: AnnotationData) {
                                    return (
                                        this.annotations.data?.subpleuralSpace.microConsolidations
                                            .isPresent === true
                                    );
                                },
                            },
                            coverageAboveOrEqual50: {
                                type: Boolean,
                                required: function (this: AnnotationData) {
                                    return (
                                        this.annotations.data?.subpleuralSpace.microConsolidations
                                            .isPresent === true
                                    );
                                },
                            },
                    },
                },
                macroConsolidations: {
                    isPresent: {
                        type: Boolean,
                        required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
                    },
                    specifics: {
                            isSingle: {
                                type: Boolean,
                                required: function (this: AnnotationData) {
                                    return (
                                        this.annotations.data?.subpleuralSpace.macroConsolidations
                                            .isPresent === true
                                    );
                                },
                            },
                            coverageAboveOrEqual50: {
                                type: Boolean,
                                required: function (this: AnnotationData) {
                                    return (
                                        this.annotations.data?.subpleuralSpace.macroConsolidations
                                            .isPresent === true
                                    );
                                },
                            },
                            airBronchogram: {
                                isPresent: {
                                    type: Boolean,
                                    required: function (this: AnnotationData) {
                                        return (
                                            this.annotations.data?.subpleuralSpace.macroConsolidations
                                                .isPresent === true
                                        );
                                    },
                                },
                                specifics: {
                                        isStatic: {
                                            type: Boolean,
                                            // In nested required fields, multiple conditions have to be checked
                                            required: function (this: AnnotationData) {
                                                return (
                                                    this.annotations.data?.subpleuralSpace
                                                        .macroConsolidations
                                                        .isPresent === true &&
                                                    this.annotations.data?.subpleuralSpace
                                                        .macroConsolidations.specifics
                                                        ?.airBronchogram?.isPresent ===
                                                        true
                                                );
                                            },
                                        },
                                        isFluid: {
                                            type: Boolean,
                                            required: function (this: AnnotationData) {
                                                return (
                                                    this.annotations.data?.subpleuralSpace
                                                        .macroConsolidations
                                                        .isPresent === true &&
                                                    this.annotations.data?.subpleuralSpace
                                                        .macroConsolidations.specifics
                                                        ?.airBronchogram?.isPresent ===
                                                        true
                                                );
                                            },
                                        },
                                },
                            },
                            dopplerData: {
                                isAvailable: {
                                    type: Boolean,
                                    required: function (this: AnnotationData) {
                                        return (
                                            this.annotations.data?.subpleuralSpace.macroConsolidations
                                                .isPresent === true
                                        );
                                    },
                                },
                                specifics: {
                                        isVascularizationPresent: {
                                            type: Boolean,
                                            required: function (this: AnnotationData) {
                                                return (
                                                    this.annotations.data?.subpleuralSpace.macroConsolidations
                                                        .isPresent === true &&
                                                    this.annotations.data?.subpleuralSpace.macroConsolidations
                                                        .specifics?.dopplerData?.isAvailable ===
                                                        true
                                                );
                                            },
                                        },
                                        isCoherentWithAnatomy: {
                                            type: Boolean,
                                            required: function (this: AnnotationData) {
                                                return (
                                                    this.annotations.data?.subpleuralSpace.macroConsolidations
                                                        .isPresent === true &&
                                                    this.annotations.data?.subpleuralSpace.macroConsolidations
                                                        .specifics?.dopplerData?.isAvailable ===
                                                        true
                                                );
                                            },
                                        },
                                },
                            }
                    },
                },
            },
            pleuralEffusion: {
                isPresent: {
                    type: Boolean,
                    required: function (this: AnnotationData) {this.annotations.isQualitySufficient === true;},
                },
                specifics: {
                        characterization: {
                            type: String,
                            enum: ["complex", "hypo-anechoic"],
                            required: function (this: AnnotationData) {
                                return this.annotations.data?.pleuralEffusion.isPresent === true;
                            },
                        },
                        isSeptaPresent: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return this.annotations.data?.pleuralEffusion.isPresent === true;
                            },
                        },
                },
            },
        },
        textDescription: {
            type: String,
            required: true,
            checkLength: function (val: string) {
                return val.length > 50;
            },
        },
        confidence: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
    },
});

export default mongoose.model("Annotations", annotationSchema);
