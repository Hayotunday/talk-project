"use client";

import { ChangeEvent } from "react";
import Image from "next/image";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "image";
  handleChangeImage?: (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => void;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  handleChangeImage,
}: FormInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {type === "image" ? (
            <>
              <FormLabel className="flex flex-col items-start gap-2">
                <FormLabel className="label">{label}</FormLabel>
                <div className="flex flex-row w-24 h-24 rounded-full justify-center items-center gap-2 bg-gray-100">
                  {field.value ? (
                    <Image
                      src={field.value}
                      alt="profile photo"
                      width={96}
                      height={96}
                      priority
                      className="rounded-full object-contain"
                    />
                  ) : (
                    <Image
                      src={"/profile.svg"}
                      alt="profile photo"
                      width={24}
                      height={24}
                      className="rounded-full object-contain"
                    />
                  )}
                </div>
              </FormLabel>
              <FormControl className="w-24 text-base font-semibold text-gray-200">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer border-none bg-transparent outline-none !file:hidden"
                  onChange={(e) => handleChangeImage?.(e, field.onChange)}
                />
              </FormControl>
            </>
          ) : (
            <>
              <FormLabel className="label">{label}</FormLabel>
              <FormControl>
                <Input
                  className="input"
                  type={type}
                  placeholder={placeholder}
                  {...field}
                />
              </FormControl>
            </>
          )}
          {description && (
            <FormDescription className="text-xs text-muted-foreground">
              *{description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
