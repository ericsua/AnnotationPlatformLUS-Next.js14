"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
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
import { postVideoAction } from "@/actions/videos";
// import CounterAnnotations from "./CounterAnnotations";
const CounterAnnotations = dynamic(() => import("./CounterAnnotations"), {
    ssr: false,
});
import { incrementAnnotationsCounter } from "@/store/annotations";
import NumberInput from "./NumberInput"; // will be used in the future
import AnimateSlide from "./AnimateSlide";
import { FormData, FormSchema, RegisterName } from "@/types/FormSchema";

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
    // the Form has type FormData inferred from a Zod schema
    } = useForm<FormData>({
        // custom resolver with Zod schemam, meaning that the form fields are validated with the Zod schema instead of 
        // the react-hook-form validation
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
    // console.log(getValues("subpleuralSpace.macroConsolidations.isPresent"));

    // select the video ID from the Redux store
    const videoID = useSelector((state: RootState) => state.videoState.id);
    const videoStatus = useSelector(
        (state: RootState) => state.videoState.status
    );
    const videoError = useSelector(
        (state: RootState) => state.videoState.error
    );
    const dispatch = useDispatch<AppDispatch>();

    const [disableSubmit, setDisableSubmit] = useState(false);
    
    // watch the values of the form fields
    const isQualitySufficientWatch = watch(`isQualitySufficient`);
    const isRegularWatch = watch(`data.pleuralLine.isRegular`);
    const isHorizontalArtifactsPresentWatch = watch(
        `data.horizontalArtifacts.isPresent`
    );
    const isVerticalArtifactsPresentWatch = watch(
        `data.verticalArtifacts.isPresent`
    );
    const isMicroConsolidationsPresentWatch = watch(
        `data.subpleuralSpace.microConsolidations.isPresent`
    );
    const isMacroConsolidationsPresentWatch = watch(
        `data.subpleuralSpace.macroConsolidations.isPresent`
    );
    const isAirBronchogramPresentWatch = watch(
        `data.subpleuralSpace.macroConsolidations.specifics.airBronchogram.isPresent`
    );
    const isDopplerAvailableWatch = watch(
        `data.subpleuralSpace.macroConsolidations.specifics.dopplerData.isAvailable`
    );
    const isPleuralEffusionPresentWatch = watch(`data.pleuralEffusion.isPresent`);

    useEffect(() => {
        // depending on the video status (during download from server), show a toast message
        if (videoStatus === "pending") {
            // console.log("Pending: Loading the video...");
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.body.classList.add("overflow-hidden");
            document.getElementById("blocker")?.classList.remove("hidden");
            // Sets the video status to "idle" in the Redux store
            dispatch(resetVideoStatus());
            setDisableSubmit(true);
        } else if (videoStatus === "fulfilled") {
            // console.log("Fulfilled: Video loaded successfully!");
            document.body.classList.remove("overflow-hidden");
            document.getElementById("blocker")?.classList.add("hidden");
            toast.success("Video loaded successfully!", {
                position: "top-center",
            });
            // Sets the video status to "idle" in the Redux store
            dispatch(resetVideoStatus());
            setDisableSubmit(false);

        } else if (videoStatus === "rejected") {
            // console.log("Rejected: An error occurred while loading the video.");
            document.body.classList.remove("overflow-hidden");
            document.getElementById("blocker")?.classList.add("hidden");
            toast.error(
                videoError?.message ||
                    "An error occurred while loading the video.",
                {
                    position: "top-center",
                }
            );
            // Sets the video status to "idle" in the Redux store
            dispatch(resetVideoStatus());
            setDisableSubmit(true);
        }
    }, [videoStatus]);

    // when the user submits the form
    const onSubmit = async (data: FormData) => {
        // console.log("data to POST", data);
        // @ts-ignore
        // data.verticalArtifacts.isPresent = 3;
        // window.alert("data to POST: " + JSON.stringify(data));
        
        // show a spinner while the form is being submitted
        const pSpinner = document.getElementById("p-spinner");
        if (pSpinner) {
            pSpinner.innerText = "Uploading annotation...";
        }
        // server action to post the form data (no await here, because we use react-hot-toast to show the status of the form submission)
        const postPromise = postVideoAction(data, videoID);
        toast.promise(
            //fetch(serverUrlBase + "/api/v1/video/" + videoID, {
            postPromise,
            {
                loading: "Loading...",
                success: "Annotation submitted successfully!",
                error: (error) =>
                    "An error occurred while submitting the form"
            }
        );
        // also during the submission, perform the following actions
        // 1. reset the videoID and videoFilename in the Redux store
        // 2. get id and filename of the next video and update the Redux store
        // 3. increment the counter of annotations submitted by the user (local storage only)

        try {
            const { status } = await postPromise;
            if (status && status === 201) {
                // console.log("annotation submitted successfully");
                dispatch(setVideoID(""));
                dispatch(setVideoFilename(""));
                dispatch(getNewVideo());
                dispatch(incrementAnnotationsCounter());
                setDisableSubmit(false);
                reset();
            }
            // console.log("status", status);
            //reset();
        } catch (error) {
            // console.log("error catched", error);
            try {
                // try to parse the error message as JSON (which is an expected error from the server with status 455 of Zod validation error)
                const errorObj = JSON.parse((error as Error).message);
                const status = errorObj.status;
                const jsonData = errorObj.jsonData;
                // console.log("error zod data", jsonData);
                
                // if the error is a Zod validation error (status 455), show the error messages in the form
                if (status && status === 455 && jsonData) {
                    // console.log("zod validation error");
                    const zodMessage = jsonData.message;
                    // list of errors from Zod validation, one for each wrong field in the form 
                    const zodErrors = jsonData.errors;
                    // console.log("zodMessage", zodMessage);
                    // console.log("zodErrors", zodErrors);
                    const zodErrorsKeys = Object.keys(zodErrors);
                    // console.log("zodErrorsKeys", zodErrorsKeys);
                    // zodErrorsKeys.forEach((key) => {
                    //     setError(key as RegisterName, {
                    //         type: "server",
                    //         message: zodErrors[key],
                    //     }, { shouldFocus: true });
                    // });

                    // for each not valid field, set the error message in the form
                    for (let key of zodErrorsKeys) {
                        setError(
                            key as RegisterName,
                            {
                                // error type "server" is a custom type to show the error message in the form
                                type: "server",
                                message: zodErrors[key],
                            },
                            // to make the browser focus on the first error field (doesn't work atm)
                            { shouldFocus: true }
                        );
                    }
                }
            } catch (e) {
                console.log("not a 455 (Zod) error", e);
                // unknown error
            }
        }
        //reset();
    };

    return (
        <>
            {/* // full page blur while submitting/getting new video, to avoid unwanted multiple actions (e.g. click other things) */}
            <div
                id="blocker"
                className="fixed left-0 top-0 w-screen h-screen backdrop-blur z-50 hidden"
            >
                {/* // spinner while loading the next video */}
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

            {/* // form with all the fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="form">
                {/* // pleural line depth in centimeters component, to be used in the future 
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
                /> */}

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"isQualitySufficient"}
                    errors={errors}
                    label="Is the quality of the video sufficient such that it can be annotated? (Don't overuse this option, only if you are sure that the video is not suitable for annotation, and if so, please provide a reason in the free text field below.)"
                    options={[true, false]}
                    optionsLabels={["Yes", "No"]}
                    isBoolean={true}
                />

                <AnimatePresence key="qualityNotSufficient">
                    {
                        // @ts-ignore
                        (isQualitySufficientWatch as string) === "true" && (
                            <AnimateSlide>
                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={"data.pleuralLine.isRegular"}
                                    errors={errors}
                                    label="Is the pleural line regular or irregular?"
                                    options={[true, false]}
                                    optionsLabels={["Regular (smooth)", "Irregular (coarse)"]}
                                    isBoolean={true}
                                />

                                {/* AnimatePresence is used as a container to animate the dis/appearance of the next field, since it is hidden (not present 
                                    in the tree) based on the value of the previous field (pleuralLine.isRegular). The field is shown only if 
                                    the value of the previous field is "false" */}
                                <AnimatePresence key="pleuralLineSpecifics">
                                    {
                                        // @ts-ignore
                                        (isRegularWatch as string) === "false" && (
                                            // AnimateSlide is a custom component to animate the appearance of the field so that it slides down from the top
                                            // when it appears and slides up when it disappears
                                            <AnimateSlide>
                                                <RadioBox
                                                    register={register}
                                                    unregister={unregister}
                                                    registerName={
                                                        "data.pleuralLine.specificsIrregular.isContinuous"
                                                    }
                                                    errors={errors}
                                                    label="Given that the pleural line is irregular, is it continuous or broken?"
                                                    options={[true, false]}
                                                    optionsLabels={[
                                                        "Continuous",
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
                                    registerName={"data.axisScan"}
                                    errors={errors}
                                    label="The axis of the scan is:"
                                    options={["longitudinal", "horizontal"]}
                                    optionsLabels={[
                                        "Longitudinal, with the ribs",
                                        "Horizontal, without the ribs",
                                    ]}
                                    isBoolean={false}
                                />

                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={"data.isPleuralSlidingPresent"}
                                    errors={errors}
                                    label="Is the pleural sliding present?"
                                    options={[true, false]}
                                    optionsLabels={["Yes", "No"]}
                                    isBoolean={true}
                                />

                                <RadioBox
                                    register={register}
                                    unregister={unregister}
                                    registerName={"data.horizontalArtifacts.isPresent"}
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
                                                        "data.horizontalArtifacts.specifics.coverageAboveOrEqual50"
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
                                    registerName={"data.verticalArtifacts.isPresent"}
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
                                                        "data.verticalArtifacts.specifics.coverageAboveOrEqual50"
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
                                        "data.subpleuralSpace.microConsolidations.isPresent"
                                    }
                                    errors={errors}
                                    label="Are micro-consolidations present? (hypo-echoic nodules smaller in diameter than 5 mm)"
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
                                                        "data.subpleuralSpace.microConsolidations.specifics.isSingle"
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
                                                        "data.subpleuralSpace.microConsolidations.specifics.coverageAboveOrEqual50"
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
                                        "data.subpleuralSpace.macroConsolidations.isPresent"
                                    }
                                    errors={errors}
                                    label="Are macro-consolidations present? (hypo-echoic nodules larger in diameter than 5 mm)"
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
                                                        "data.subpleuralSpace.macroConsolidations.specifics.isSingle"
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
                                                        "data.subpleuralSpace.macroConsolidations.specifics.coverageAboveOrEqual50"
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
                                                        "data.subpleuralSpace.macroConsolidations.specifics.airBronchogram.isPresent"
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
                                                                "data.subpleuralSpace.macroConsolidations.specifics.airBronchogram.specifics.isStatic"
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
                                                                "data.subpleuralSpace.macroConsolidations.specifics.airBronchogram.specifics.isFluid"
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
                                                            "data.subpleuralSpace.macroConsolidations.specifics.dopplerData.isAvailable"
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
                                                                "data.subpleuralSpace.macroConsolidations.specifics.dopplerData.specifics.isVascularizationPresent"
                                                            }
                                                            errors={errors}
                                                            label="Given that the Doppler data is available, is the vascularization of the consolidations present?"
                                                            options={[true, false]}
                                                            optionsLabels={["Yes", "No"]}
                                                            isBoolean={true}
                                                            nesting={4}
                                                        />
                                                        <RadioBox
                                                            register={register}
                                                            unregister={unregister}
                                                            registerName={
                                                                "data.subpleuralSpace.macroConsolidations.specifics.dopplerData.specifics.isCoherentWithAnatomy"
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
                                    registerName={"data.pleuralEffusion.isPresent"}
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
                                                        "data.pleuralEffusion.specifics.characterization"
                                                    }
                                                    errors={errors}
                                                    label="Given that the pleural effusion is present, how is it characterized?"
                                                    options={["complex", "hypo-anechoic"]}
                                                    optionsLabels={["Complex", "Hypo-anechoic"]}
                                                    isBoolean={false}
                                                    nesting={1}
                                                />
                                                <RadioBox
                                                    register={register}
                                                    unregister={unregister}
                                                    registerName={
                                                        "data.pleuralEffusion.specifics.isSeptaPresent"
                                                    }
                                                    errors={errors}
                                                    label="Given that the pleural effusion is present, how is it characterized?"
                                                    options={[true, false]}
                                                    optionsLabels={[
                                                        "With septa",
                                                        "Without septa (= corpuscular)",
                                                    ]}
                                                    isBoolean={true}
                                                    nesting={1}
                                                />
                                            </AnimateSlide>
                                        )
                                    }
                                </AnimatePresence>

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
                    label="Describe with free text whether the overall quality is sufficient or not to be evaluated confidently. Please include any additional information that you consider relevant, e.g. problems with the video, important points not asked in the form."
                    nameInRequired="free"
                    minLength={50}
                />

                <RadioBox
                    register={register}
                    unregister={unregister}
                    registerName={"confidence"}
                    errors={errors}
                    label="What is your level of confidence in the annotation you are submitting?"
                    options={["high", "medium", "low"]}
                    optionsLabels={["High", "Medium", "Low"]}
                    isBoolean={true}
                />

                <div className="grid xl:grid-cols-3 xl:grid-rows-1 place-items-center grid-rows-2 grid-cols-3 gap-4">
                    <button
                        type="reset"
                        onClick={() => reset()}
                        className="btn btn-reset justify-self-start xl:col-start-1 col-start-1 row-start-1"
                    >
                        Reset
                    </button>
                    <button
                        disabled={isSubmitting || disableSubmit}
                        type="submit"
                        className="btn xl:col-start-2 col-start-3 row-start-1"
                    >
                        Submit
                    </button>
                    <CounterAnnotations />
                </div>
            </form>
        </>
    );
}
