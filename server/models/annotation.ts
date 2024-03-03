import mongoose from "mongoose";
import { z } from "zod";

const Schema = mongoose.Schema;

const requiredErrorMessage = {invalid_type_error: "Please select an option"};

export const FormSchema = z.object({
    pleuralLine: z.object({
        depthInCentimeters: z.number({errorMap: () => ({message: "The number must be between 0 and 1 and have at most one decimal"})}).min(0).max(1).step(0.1),
        isRegular: z.boolean(requiredErrorMessage),
        specificsIrregular: z.object({
            isContinuous: z.boolean(requiredErrorMessage).nullable(),
        }).nullable().default(null),
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
                isDopplerAvailable: z.boolean(requiredErrorMessage).nullable(),
                specificsDopplerBronchogram: z.object({
                    isVascularizationPresent: z.boolean(requiredErrorMessage).nullable(),
                    isCoherentWithAnatomy: z.boolean(requiredErrorMessage).nullable(),
                }).nullable().default(null),
            }).nullable().default(null),
        }).refine((data) => { return (data.isPresent === true ? data.specifics?.isSingle !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.isSingle"]})
        .refine((data) => { return (data.isPresent === true ? data.specifics?.coverageAboveOrEqual50 !== null : true)}, { message: "If the macro-consolidations are present, the specifics must be filled", path: ["specifics.coverageAboveOrEqual50"]})
        .refine((data) => { return (data.specifics?.airBronchogram?.isPresent === true ? data.specifics.airBronchogram.specifics?.isStatic !== null : true)}, { message: "If the air bronchogram is present, the specifics must be filled", path: ["specifics.airBronchogram.specifics.isStatic"]})
        .refine((data) => { return (data.specifics?.airBronchogram?.isPresent === true ? data.specifics.airBronchogram.specifics?.isFluid !== null : true)}, { message: "If the air bronchogram is present, the specifics must be filled", path: ["specifics.airBronchogram.specifics.isFluid"]})
        .refine((data) => { return (data.specifics?.isDopplerAvailable === true ? data.specifics.specificsDopplerBronchogram?.isVascularizationPresent !== null : true)}, { message: "If the Doppler data is available, the specifics must be filled", path: ["specifics.specificsDopplerBronchogram.isVascularizationPresent"]})
        .refine((data) => { return (data.specifics?.isDopplerAvailable === true ? data.specifics.specificsDopplerBronchogram?.isCoherentWithAnatomy !== null : true)}, { message: "If the Doppler data is available, the specifics must be filled", path: ["specifics.specificsDopplerBronchogram.isCoherentWithAnatomy"]}),
    }),
    pleuralEffusion: z.object({
        isPresent: z.boolean(requiredErrorMessage),
        specifics: z.object({
            isCorpusculated: z.boolean(requiredErrorMessage).nullable(),
            isSeptaPresent: z.boolean(requiredErrorMessage).nullable(),
        }).nullable().default(null),
    }).refine((data) => { return data.isPresent === true ? data.specifics?.isCorpusculated !== null : true }, { message: "If the pleural effusion is present, the specifics must be filled", path: ["specifics.isCorpuscolated"]})
    .refine((data) => { return data.isPresent === true ? data.specifics?.isSeptaPresent !== null : true }, { message: "If the pleural effusion is present, the specifics must be filled", path: ["specifics.isSeptaPresent"]}),
    textDescription: z.string(requiredErrorMessage).min(50, {message: "The description must be at least 50 characters long"}),
});

export type FormData = z.infer<typeof FormSchema>;

export type AnnotationData ={videoId: string, date: Date, annotations: FormData};

const annotationSchema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: "Videos", required: true },
    date: { type: Date, default: Date.now },
    annotations: {
        pleuralLine: {
            depthInCentimeters: {
                type: Number,
                required: true,
                checkMinMax: function (val: number) {
                    return val >= 0 && val <= 1;
                },
            },
            isRegular: { type: Boolean, required: true },
            specificsIrregular: {
                    isContinuous: {
                        type: Boolean,
                        required: function (this: AnnotationData) {
                            return this.annotations.pleuralLine.isRegular === false;
                        },
                    },
            },
        },
        axisScan: {
            type: String,
            enum: ["longitudinal", "horizontal"],
            required: true,
        },
        isPleuralSlidingPresent: {
            type: Boolean,
            required: true,
        },
        horizontalArtifacts: {
            isPresent: {
                type: Boolean,
                required: true,
            },
            specifics: {
                coverageAboveOrEqual50: {
                    type: Boolean,
                    required: function (this: AnnotationData) {
                        return this.annotations.horizontalArtifacts.isPresent === true;
                    },
                },
            },
        },
        verticalArtifacts: {
            isPresent: {
                type: Boolean,
                required: true,
            },
            specifics: {
                coverageAboveOrEqual50: {
                    type: Boolean,
                },
            },
        },
        subpleuralSpace: {
            microConsolidations: {
                isPresent: {
                    type: Boolean,
                    required: true,
                },
                specifics: {
                        isSingle: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return (
                                    this.annotations.subpleuralSpace.microConsolidations
                                        .isPresent === true
                                );
                            },
                        },
                        coverageAboveOrEqual50: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return (
                                    this.annotations.subpleuralSpace.microConsolidations
                                        .isPresent === true
                                );
                            },
                        },
                },
            },
            macroConsolidations: {
                isPresent: {
                    type: Boolean,
                    required: true,
                },
                specifics: {
                        isSingle: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return (
                                    this.annotations.subpleuralSpace.macroConsolidations
                                        .isPresent === true
                                );
                            },
                        },
                        coverageAboveOrEqual50: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return (
                                    this.annotations.subpleuralSpace.macroConsolidations
                                        .isPresent === true
                                );
                            },
                        },
                        airBronchogram: {
                            isPresent: {
                                type: Boolean,
                                required: function (this: AnnotationData) {
                                    return (
                                        this.annotations.subpleuralSpace.macroConsolidations
                                            .isPresent === true
                                    );
                                },
                            },
                            specifics: {
                                    isStatic: {
                                        type: Boolean,
                                        required: function (this: AnnotationData) {
                                            return (
                                                this.annotations.subpleuralSpace
                                                    .macroConsolidations
                                                    .isPresent === true &&
                                                this.annotations.subpleuralSpace
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
                                                this.annotations.subpleuralSpace
                                                    .macroConsolidations
                                                    .isPresent === true &&
                                                this.annotations.subpleuralSpace
                                                    .macroConsolidations.specifics
                                                    ?.airBronchogram?.isPresent ===
                                                    true
                                            );
                                        },
                                    },
                            },
                        },
                        isDopplerAvailable: {
                            type: Boolean,
                            required: function (this: AnnotationData) {
                                return (
                                    this.annotations.subpleuralSpace.macroConsolidations
                                        .isPresent === true
                                );
                            },
                        },
                        specificsDopplerBronchogram: {
                                isVascularizationPresent: {
                                    type: Boolean,
                                    required: function (this: AnnotationData) {
                                        return (
                                            this.annotations.subpleuralSpace.macroConsolidations
                                                .isPresent === true &&
                                            this.annotations.subpleuralSpace.macroConsolidations
                                                .specifics?.isDopplerAvailable ===
                                                true
                                        );
                                    },
                                },
                                isCoherentWithAnatomy: {
                                    type: Boolean,
                                    required: function (this: AnnotationData) {
                                        return (
                                            this.annotations.subpleuralSpace.macroConsolidations
                                                .isPresent === true &&
                                            this.annotations.subpleuralSpace.macroConsolidations
                                                .specifics?.isDopplerAvailable ===
                                                true
                                        );
                                    },
                                },
                        },
                },
            },
        },
        pleuralEffusion: {
            isPresent: {
                type: Boolean,
                required: true,
            },
            specifics: {
                    isCorpusculated: {
                        type: Boolean,
                        required: function (this: AnnotationData) {
                            return this.annotations.pleuralEffusion.isPresent === true;
                        },
                    },
                    isSeptaPresent: {
                        type: Boolean,
                        required: function (this: AnnotationData) {
                            return this.annotations.pleuralEffusion.isPresent === true;
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
    },
});

const required = function (this: AnnotationData) {
    console.log("THISSSSSS", this)
    return this.annotations.verticalArtifacts.isPresent === true;
}
// @ts-ignore
annotationSchema.path("annotations.verticalArtifacts.specifics.coverageAboveOrEqual50").required(required, "If the vertical artifacts are present, the specifics must be filled");

export default mongoose.model("Annotations", annotationSchema);
