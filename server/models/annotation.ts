import mongoose from "mongoose";

const Schema = mongoose.Schema;

const annotationSchema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: "Videos", required: true },
    userId: String,
    date: { type: Date, default: Date.now },
    annotations: {
        option1: {
            type: String,
            required: true,
        },
        option2: {
            type: String,
            required: true,
        },
        option3: {
            type: String,
            required: true,
        },
        option4: {
            type: String,
            required: true,
        },
        option5: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            checkLength: function (val: string) {
                return val.length > 50;
            }
        },
    },
});

export default mongoose.model("Annotations", annotationSchema);