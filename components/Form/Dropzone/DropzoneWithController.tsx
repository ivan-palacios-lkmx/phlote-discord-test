import { useFormContext } from "react-hook-form";
import { Controller } from "react-hook-form";

import Dropzone from "./Dropzone";

interface DropzoneProps {
  name: string;
  dragActiveText: string;
  placeholderText: string;
}
// TODO: Make this work with RHF
export default function DropzoneWithController({
  name,
  dragActiveText,
  placeholderText,
}: DropzoneProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Dropzone
          onChange={onChange}
          value={value}
          dragActiveText={dragActiveText}
          placeholderText={placeholderText}
        />
      )}
    />
  );
}
