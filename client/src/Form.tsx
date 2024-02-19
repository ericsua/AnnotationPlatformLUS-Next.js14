import { useForm } from "react-hook-form";
import RadioBox from "./RadioBox";
import TextArea from "./TextArea";
import React from "react";

export interface FormData {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    text: string;
}

export default function Form() {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <RadioBox
                name="option1"
                control={control}
                errors={errors}
                label="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, architecto!"
                options={["Option1", "Option2", "Option3"]}
            />
            <RadioBox
                name="option2"
                control={control}
                errors={errors}
                label="Doloribus saepe id non illo ad eius sed minus corrupti facere beatae."
                options={["Option2A", "Option2B", "Option2C"]}
            />
            <RadioBox
                name="option3"
                control={control}
                errors={errors}
                label="Ratione cupiditate modi consequuntur sapiente blanditiis repellat similique error nihil numquam non soluta sit perferendis sint quis, itaque recusandae illo, quam facilis molestias voluptate repudiandae quae! Consequatur."
                options={["Option3A", "Option3B", "Option3C"]}
            />
            <RadioBox
                name="option4"
                control={control}
                errors={errors}
                label="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Esse accusamus natus pariatur nulla eligendi tempora."
                options={["Option4A", "Option4B", "Option4C"]}
            />
            <RadioBox
                name="option5"
                control={control}
                errors={errors}
                label="Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis quibusdam repellendus eligendi."
                options={["Option5A", "Option5B", "Option5C"]}
            />
            <TextArea
                control={control}
                errors={errors}
                label="Free description"
                nameInRequired="free"
                minLength={50}
            />
            {/* <div className="txtContainer">
        <label className="lblRadio">
          Free description (minimum 50 characters):
        </label>
        <div className="txtAreaContainer">
          <Controller
            name="text"
            control={control}
            defaultValue=""
            rules={{
              required:
                "The free description is required, and must be at least 50 characters long.",
              minLength: {
                value: 50,
                message: "Text must be at least 50 characters long",
              },
            }}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Enter your free description here..."
              />
            )}
          />
          {errors.text && (
            <span className="spanError">{errors.text.message}</span>
          )}
        </div>
      </div> */}

            <div className="btnContainer">
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}
