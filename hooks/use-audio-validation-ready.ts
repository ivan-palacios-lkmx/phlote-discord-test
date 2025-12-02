import { useValidateAudioDuration } from "@/hooks/use-validate-audio-duration";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

export function useAudioValidationReady() {
  const { control } = useFormContext();

  const bounceValue = useWatch({ control, name: "bounce" });
  const stemsValue = useWatch({ control, name: "stems" });

  const bounceHash = useMemo(
    () => (typeof bounceValue === "string" ? bounceValue : undefined),
    [bounceValue],
  );

  const stemsArray = useMemo(() => (Array.isArray(stemsValue) ? stemsValue : []), [stemsValue]);

  const stemHashes = useMemo(
    () =>
      stemsArray
        .map((stem: { hash?: string; id?: string }) => stem?.hash || stem?.id)
        .filter((hash): hash is string => !!hash),
    [stemsArray],
  );

  const allStemsProcessed = useMemo(
    () => stemsArray.length === 0 || stemHashes.length === stemsArray.length,
    [stemsArray.length, stemHashes.length],
  );

  const shouldValidate = useMemo(
    () => !!bounceHash && stemHashes.length > 0 && allStemsProcessed,
    [bounceHash, stemHashes.length, allStemsProcessed],
  );

  const { data: validationResult, isLoading: isValidating } = useValidateAudioDuration({
    bounceHash,
    stemHashes,
    enabled: shouldValidate,
  });

  const isAudioValid = useMemo(() => validationResult?.valid === true, [validationResult?.valid]);

  return {
    allFilesProcessed: shouldValidate, // Todos tienen hash = todos procesados
    isProcessing: !shouldValidate && (!!bounceHash || stemHashes.length > 0),

    isAudioValid,
    isValidating,
    validationResult,

    bounceHash,
    stemHashes,
  };
}
