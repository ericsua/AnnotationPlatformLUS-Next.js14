"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { ZodNumber, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import RadioBox from "./RadioBox";
import TextArea from "./TextArea";
import { AppDispatch, RootState } from "@/store/store";
import {
    getNewVideo,
    resetVideoStatus,
    setVideoFilename,
    setVideoID,
} from "@/store/videoState";
import { postVideoAction } from "@/app/actions";
// import CounterAnnotations from "./CounterAnnotations";
const CounterAnnotations = dynamic(() => import("./CounterAnnotations"), {
    ssr: false,
});
import { incrementAnnotationsCounter } from "@/store/annotations";
import NumberInput from "./NumberInput";
import AnimateSlide from "./AnimateSlide";

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

const FormSchema = z.object({
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
            ),
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
                        isDopplerAvailable: z
                            .string(requiredErrorMessage)
                            .transform((val, ctx) =>
                                convertStringToBoolean(val, ctx)
                            )
                            .nullable(),
                        specificsDopplerBronchogram: z
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
                    return data.specifics?.isDopplerAvailable === true
                        ? data.specifics.specificsDopplerBronchogram
                              ?.isVascularizationPresent !== null
                        : true;
                },
                {
                    message:
                        "If the Doppler data is available, the specifics must be filled",
                    path: [
                        "specifics.specificsDopplerBronchogram.isVascularizationPresent",
                    ],
                }
            )
            .refine(
                (data) => {
                    return data.specifics?.isDopplerAvailable === true
                        ? data.specifics.specificsDopplerBronchogram
                              ?.isCoherentWithAnatomy !== null
                        : true;
                },
                {
                    message:
                        "If the Doppler data is available, the specifics must be filled",
                    path: [
                        "specifics.specificsDopplerBronchogram.isCoherentWithAnatomy",
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
                    isCorpusculated: z
                        .string(requiredErrorMessage)
                        .transform((val) => val === "true")
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
                    ? data.specifics?.isCorpusculated !== null
                    : true;
            },
            {
                message:
                    "If the pleural effusion is present, the specifics must be filled",
                path: ["specifics.isCorpusculated"],
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
});

export type FormData = z.infer<typeof FormSchema>;
export type FormDataUI = z.input<typeof FormSchema>;

type NestedKeys<T> = T extends object
    ? {
          [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${NestedKeys<T[K]>}`}`;
      }[keyof T]
    : never;

export type RegisterName = NestedKeys<FormData>;

export default function Form() {
    const {
        register,
        unregister,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        getValues,
        setError,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(FormSchema),
    }); // { shouldFocusError: false }
    // console.log(
    //     "numberInput",
    //     getValues("pleuralLine.depthInCentimeters"),
    //     typeof getValues("pleuralLine.depthInCentimeters"),
    //     getValues("pleuralLine.depthInCentimeters") === "",
    //     getValues("pleuralLine.depthInCentimeters") === null,
    //     getValues("pleuralLine.depthInCentimeters") === undefined
    // );
    const videoID = useSelector((state: RootState) => state.videoState.id);
    const videoStatus = useSelector(
        (state: RootState) => state.videoState.status
    );
    const videoError = useSelector(
        (state: RootState) => state.videoState.error
    );
    const dispatch = useDispatch<AppDispatch>();

    const isRegularWatch = watch(`pleuralLine.isRegular`);
    const isHorizontalArtifactsPresentWatch = watch(
        `horizontalArtifacts.isPresent`
    );
    const isVerticalArtifactsPresentWatch = watch(
        `verticalArtifacts.isPresent`
    );
    const isMicroConsolidationsPresentWatch = watch(
        `subpleuralSpace.microConsolidations.isPresent`
    );
    const isMacroConsolidationsPresentWatch = watch(
        `subpleuralSpace.macroConsolidations.isPresent`
    );
    const isAirBronchogramPresentWatch = watch(
        `subpleuralSpace.macroConsolidations.specifics.airBronchogram.isPresent`
    );
    const isDopplerAvailableWatch = watch(
        `subpleuralSpace.macroConsolidations.specifics.isDopplerAvailable`
    );
    const isPleuralEffusionPresentWatch = watch(`pleuralEffusion.isPresent`);

    useEffect(() => {
        if (videoStatus === "pending") {
            console.log("Pending: Loading the video...");
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.body.classList.add("overflow-hidden");
            document.getElementById("blocker")?.classList.remove("hidden");
            dispatch(resetVideoStatus());
        } else if (videoStatus === "fulfilled") {
            console.log("Fulfilled: Video loaded successfully!");
            document.body.classList.remove("overflow-hidden");
            document.getElementById("blocker")?.classList.add("hidden");
            toast.success("Video loaded successfully!", {
                position: "top-center",
            });
            dispatch(resetVideoStatus());
        } else if (videoStatus === "rejected") {
            console.log("Rejected: An error occurred while loading the video.");
            document.body.classList.remove("overflow-hidden");
            document.getElementById("blocker")?.classList.add("hidden");
            toast.error(
                videoError?.message ||
                    "An error occurred while loading the video.",
                {
                    position: "top-center",
                }
            );
            dispatch(resetVideoStatus());
        }
    }, [videoStatus]);

    const onSubmit = async (data: FormData) => {
        console.log("data to POST", data);
        // @ts-ignore
        // data.verticalArtifacts.isPresent = 3;
        // window.alert("data to POST: " + JSON.stringify(data));
        const pSpinner = document.getElementById("p-spinner");
        if (pSpinner) {
            pSpinner.innerText = "Uploading annotation...";
        }
        const postPromise = postVideoAction(data, videoID);
        toast.promise(
            //fetch(serverUrlBase + "/api/v1/video/" + videoID, {
            postPromise,
            {
                loading: "Loading...",
                success: "Annotation submitted successfully!",
                error: "An error occurred while submitting the form.",
            }
        );
        try {
            const { status } = await postPromise;
            if (status && status === 201) {
                console.log("annotation submitted successfully");
                dispatch(setVideoID(""));
                dispatch(setVideoFilename(""));
                dispatch(getNewVideo());
                dispatch(incrementAnnotationsCounter());
                reset();
            }
            console.log("status", status);
            //reset();
        } catch (error) {
            console.log("error catched", error);
            try {
                const errorObj = JSON.parse((error as Error).message);
                const status = errorObj.status;
                const jsonData = errorObj.jsonData;
                console.log("error zod data", jsonData);
                if (status && status === 455 && jsonData) {
                    console.log("zod validation error");
                    const zodMessage = jsonData.message;
                    const zodErrors = jsonData.errors;
                    console.log("zodMessage", zodMessage);
                    console.log("zodErrors", zodErrors);
                    const zodErrorsKeys = Object.keys(zodErrors);
                    console.log("zodErrorsKeys", zodErrorsKeys);
                    // zodErrorsKeys.forEach((key) => {
                    //     setError(key as RegisterName, {
                    //         type: "server",
                    //         message: zodErrors[key],
                    //     }, { shouldFocus: true });
                    // });
                    for (let key of zodErrorsKeys) {
                        setError(
                            key as RegisterName,
                            {
                                type: "server",
                                message: zodErrors[key],
                            },
                            { shouldFocus: true }
                        );
                    }
                }
            } catch (e) {
                console.log("not a 455 (Zod) error", e);
            }
        }
        //reset();
    };

    return (
        <>
            <Toaster position="bottom-center" reverseOrder={false} />
            <div
                id="blocker"
                className="fixed left-0 top-0 w-screen h-screen backdrop-blur z-50 hidden"
            >
                <div className="flex flex-col justify-center items-center h-full">
                    {/* <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div> */}
                    <svg
                        className="spinner animate-rotate size-[100px]"
                        viewBox="0 0 50 50"
                    >
                        <circle
                            className="path animate-dash"
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                        ></circle>
                    </svg>
                    <p id="p-spinner" className="mt-5 font-bold text-2xl">
                        Loading next video...
                    </p>
                    {/* <p className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-black pr-5 text-5xl font-bold">
                        Loading . . .
                    </p> */}
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="form">
                {/* <RadioBox
                    register={register}
                    registerName={"option1"}
                    errors={errors}
                    label="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, architecto!"
                    options={["Option1", "Option2", "Option3"]}
                />
                <RadioBox
                    register={register}
                    registerName={"option2"}
                    errors={errors}
                    label="Doloribus saepe id non illo ad eius sed minus corrupti facere beatae."
                    options={["Option2A", "Option2B", "Option2C"]}
                />
                <RadioBox
                    register={register}
                    registerName={"option3"}
                    errors={errors}
                    label="Ratione cupiditate modi consequuntur sapiente blanditiis repellat similique error nihil numquam non soluta sit perferendis sint quis, itaque recusandae illo, quam facilis molestias voluptate repudiandae quae! Consequatur."
                    options={["Option3A", "Option3B", "Option3C"]}
                />
                <RadioBox
                    register={register}
                    registerName={"option4"}
                    errors={errors}
                    label="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Esse accusamus natus pariatur nulla eligendi tempora."
                    options={["Option4A", "Option4B", "Option4C"]}
                />
                <RadioBox
                    register={register}
                    registerName={"option5"}
                    errors={errors}
                    label="Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quibusdam repellendus eligendi."
                    options={["Option5A", "Option5B", "Option5C"]}
                /> */}
                <NumberInput
                    register={register}
                    unregister={unregister}
                    registerName={"pleuralLine.depthInCentimeters"}
                    errors={errors}
                    label="Depth in centimeters of the pleural line:"
                    nameInRequired="depth of the pleural line"
                    min={0}
                    max={1}
                    step={0.1}
                    placeholder="0.0"
                />

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"pleuralLine.isRegular"}
                    errors={errors}
                    label="Is the pleural line regular or irregular?"
                    options={[true, false]}
                    optionsLabels={["Regular", "Irregular"]}
                    isBoolean={true}
                />
                <AnimatePresence key="pleuralLineSpecifics">
                    {
                        // @ts-ignore
                        (isRegularWatch as string) === "false" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "pleuralLine.specificsIrregular.isContinuous"
                                    }
                                    errors={errors}
                                    label="Given that the pleural line is irregular, is it continuous or broken?"
                                    options={[true, false]}
                                    optionsLabels={[
                                        "Continuous (with consolidations)",
                                        "Broken (with or without consolidations)",
                                    ]}
                                    isBoolean={true}
                                    nesting={1}
                                />
                            </AnimateSlide>
                        )
                    }
                </AnimatePresence>

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"axisScan"}
                    errors={errors}
                    label="The axis of the scan is:"
                    options={["longitudinal", "horizontal"]}
                    optionsLabels={[
                        "Longitudinal (with the ribs)",
                        "Horizontal (without the ribs)",
                    ]}
                    isBoolean={false}
                />

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"isPleuralSlidingPresent"}
                    errors={errors}
                    label="Is the pleural sliding present?"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                />

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"horizontalArtifacts.isPresent"}
                    errors={errors}
                    label="Are horizontal artifacts present?"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                />
                <AnimatePresence key="horizontalArtifactsSpecifics">
                    {
                        // @ts-ignore
                        (isHorizontalArtifactsPresentWatch as string) ===
                            "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "horizontalArtifacts.specifics.coverageAboveOrEqual50"
                                    }
                                    errors={errors}
                                    label="Given that horizontal artifacts are present, is their coverage (laterally) above 50% of the visible pleural line?"
                                    options={[true, false]}
                                    optionsLabels={["Yes, ≥ 50%", "No, < 50%"]}
                                    isBoolean={true}
                                    nesting={1}
                                />
                            </AnimateSlide>
                        )
                    }
                </AnimatePresence>

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"verticalArtifacts.isPresent"}
                    errors={errors}
                    label="Are vertical artifacts present?"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                />

                <AnimatePresence key="verticalArtifactsSpecifics">
                    {
                        // @ts-ignore
                        (isVerticalArtifactsPresentWatch as string) ===
                            "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "verticalArtifacts.specifics.coverageAboveOrEqual50"
                                    }
                                    errors={errors}
                                    label="Given that vertical artifacts are present, is their coverage (laterally) above 50% of the visible pleural line?"
                                    options={[true, false]}
                                    optionsLabels={["Yes, ≥ 50%", "No, < 50%"]}
                                    isBoolean={true}
                                    nesting={1}
                                />
                            </AnimateSlide>
                        )
                    }
                </AnimatePresence>

                <label className="lblRadio !text-2xl mt-12 !mb-4">
                    About the subpleural space:
                </label>

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={
                        "subpleuralSpace.microConsolidations.isPresent"
                    }
                    errors={errors}
                    label="Are micro-consolidations present? (ipo-echoic nodules smaller in diameter than 5 mm)"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                    nesting={2}
                />

                <AnimatePresence key="microConsolidationsSpecifics">
                    {
                        // @ts-ignore
                        (isMicroConsolidationsPresentWatch as string) ===
                            "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "subpleuralSpace.microConsolidations.specifics.isSingle"
                                    }
                                    errors={errors}
                                    label="Given that micro-consolidations are present, is there a single consolidation or multiple consolidations?"
                                    options={[true, false]}
                                    optionsLabels={["Single", "Multiple"]}
                                    isBoolean={true}
                                    nesting={3}
                                />
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "subpleuralSpace.microConsolidations.specifics.coverageAboveOrEqual50"
                                    }
                                    errors={errors}
                                    label="Given that micro-consolidations are present, is their coverage (laterally) above 50% of the visible pleural line?"
                                    options={[true, false]}
                                    optionsLabels={["Yes, ≥ 50%", "No, < 50%"]}
                                    isBoolean={true}
                                    nesting={3}
                                />
                            </AnimateSlide>
                        )
                    }
                </AnimatePresence>

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={
                        "subpleuralSpace.macroConsolidations.isPresent"
                    }
                    errors={errors}
                    label="Are macro-consolidations present? (ipo-echoic nodules larger in diameter than 5 mm)"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                    nesting={2}
                />

                <AnimatePresence key="macroConsolidationsSpecifics">
                    {
                        // @ts-ignore
                        (isMacroConsolidationsPresentWatch as string) ===
                            "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "subpleuralSpace.macroConsolidations.specifics.isSingle"
                                    }
                                    errors={errors}
                                    label="Given that macro-consolidations are present, is there a single consolidation or multiple consolidations?"
                                    options={[true, false]}
                                    optionsLabels={["Single", "Multiple"]}
                                    isBoolean={true}
                                    nesting={3}
                                />
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "subpleuralSpace.macroConsolidations.specifics.coverageAboveOrEqual50"
                                    }
                                    errors={errors}
                                    label="Given that macro-consolidations are present, is their coverage (laterally) above 50% of the visible pleural line?"
                                    options={[true, false]}
                                    optionsLabels={["Yes, ≥ 50%", "No, < 50%"]}
                                    isBoolean={true}
                                    nesting={3}
                                />
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "subpleuralSpace.macroConsolidations.specifics.airBronchogram.isPresent"
                                    }
                                    errors={errors}
                                    label="Is the air bronchogram present?"
                                    options={[true, false]}
                                    optionsLabels={["Yes", "No"]}
                                    isBoolean={true}
                                    nesting={3}
                                />
                            </AnimateSlide>
                        )
                    }

                    <AnimatePresence key="airBronchogramSpecifics">
                        {
                            // @ts-ignore
                            (isMacroConsolidationsPresentWatch as string) ===
                                "true" &&
                                // @ts-ignore
                                (isAirBronchogramPresentWatch as string) ===
                                    "true" && (
                                    <AnimateSlide>
                                        <RadioBox
                                            register={register}
                                            unregister={unregister}
                                            registerName={
                                                "subpleuralSpace.macroConsolidations.specifics.airBronchogram.specifics.isStatic"
                                            }
                                            errors={errors}
                                            label="Given that the air bronchogram is present, is it static or dynamic?"
                                            options={[true, false]}
                                            optionsLabels={[
                                                "Static",
                                                "Dynamic",
                                            ]}
                                            isBoolean={true}
                                            nesting={4}
                                        />
                                        <RadioBox
                                            register={register}
                                            unregister={unregister}
                                            registerName={
                                                "subpleuralSpace.macroConsolidations.specifics.airBronchogram.specifics.isFluid"
                                            }
                                            errors={errors}
                                            label="Given that the air bronchogram is present, is it fluid?"
                                            options={[true, false]}
                                            optionsLabels={["Yes", "No"]}
                                            isBoolean={true}
                                            nesting={4}
                                        />
                                    </AnimateSlide>
                                )
                        }
                    </AnimatePresence>

                    <AnimatePresence key="macroConsolidationsDoppler">
                        {
                            // @ts-ignore
                            (isMacroConsolidationsPresentWatch as string) ===
                                "true" && (
                                <AnimateSlide>
                                    <RadioBox
                                        register={register}
                                        unregister={unregister}
                                        registerName={
                                            "subpleuralSpace.macroConsolidations.specifics.isDopplerAvailable"
                                        }
                                        errors={errors}
                                        label="Is Doppler data available?"
                                        options={[true, false]}
                                        optionsLabels={["Yes", "No"]}
                                        isBoolean={true}
                                        nesting={3}
                                    />
                                </AnimateSlide>
                            )
                        }
                    </AnimatePresence>

                    <AnimatePresence key="macroConsolidationsDopplerSpecifics">
                        {
                            // @ts-ignore
                            (isMacroConsolidationsPresentWatch as string) ===
                                "true" &&
                                // @ts-ignore
                                (isDopplerAvailableWatch as string) ===
                                    "true" && (
                                    <AnimateSlide>
                                        <RadioBox
                                            register={register}
                                            unregister={unregister}
                                            registerName={
                                                "subpleuralSpace.macroConsolidations.specifics.specificsDopplerBronchogram.isVascularizationPresent"
                                            }
                                            errors={errors}
                                            label="Given that the Doppler data is available, is the vascularization of the branchogram present?"
                                            options={[true, false]}
                                            optionsLabels={["Yes", "No"]}
                                            isBoolean={true}
                                            nesting={4}
                                        />
                                        <RadioBox
                                            register={register}
                                            unregister={unregister}
                                            registerName={
                                                "subpleuralSpace.macroConsolidations.specifics.specificsDopplerBronchogram.isCoherentWithAnatomy"
                                            }
                                            errors={errors}
                                            label="Given that the Doppler data is available, is the level of vascularization coherent with the anatomy?"
                                            options={[true, false]}
                                            optionsLabels={["Yes", "No"]}
                                            isBoolean={true}
                                            nesting={4}
                                        />
                                    </AnimateSlide>
                                )
                        }
                    </AnimatePresence>
                </AnimatePresence>

                <br />
                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"pleuralEffusion.isPresent"}
                    errors={errors}
                    label="Is the pleural effusion present?"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                />
                <AnimatePresence>
                    {
                        // @ts-ignore
                        (isPleuralEffusionPresentWatch as string) ===
                            "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "pleuralEffusion.specifics.isCorpusculated"
                                    }
                                    errors={errors}
                                    label="Given that the pleural effusion is present, how is it characterized?"
                                    options={[true, false]}
                                    optionsLabels={[
                                        "Corpuscular",
                                        "Ipo-echoic",
                                    ]}
                                    isBoolean={true}
                                    nesting={1}
                                />
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={
                                        "pleuralEffusion.specifics.isSeptaPresent"
                                    }
                                    errors={errors}
                                    label="Given that the pleural effusion is present, how is it characterized?"
                                    options={[true, false]}
                                    optionsLabels={[
                                        "With septa",
                                        "Without septa",
                                    ]}
                                    isBoolean={true}
                                    nesting={1}
                                />
                            </AnimateSlide>
                        )
                    }
                </AnimatePresence>
                <br />
                <TextArea
                    register={register}
                    unregister={unregister}
                    registerName={"textDescription"}
                    errors={errors}
                    label="Describe with free text whether the overall quality is sufficient or not to be evaluated confidently."
                    nameInRequired="free"
                    minLength={50}
                />

                <div className="grid md:grid-cols-3 md:grid-rows-1 place-items-center grid-rows-2 grid-cols-3 gap-4">
                    <button
                        type="reset"
                        className="btn btn-reset justify-self-start md:col-start-1 col-start-1 row-start-1"
                    >
                        Reset
                    </button>
                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="btn md:col-start-2 col-start-3 row-start-1"
                    >
                        Submit
                    </button>
                    <CounterAnnotations />
                </div>
            </form>
        </>
    );
}
