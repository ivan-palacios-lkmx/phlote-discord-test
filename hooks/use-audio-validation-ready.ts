import { useValidateAudioDuration } from "@/hooks/use-validate-audio-duration";
import { useMemo, useRef } from "react";
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

  const previousErrorsRef = useRef<Map<string, string>>(new Map());

  const stemErrors = useMemo(() => {
    if (validationResult) {
      if (validationResult.valid) {
        previousErrorsRef.current = new Map();
        return new Map<string, string>();
      }

      const errorMap = new Map<string, string>();
      const invalidStems = validationResult.invalidStems || [];

      invalidStems.forEach((hash) => {
        const stemDuration = validationResult.stemDurations?.find((s) => s.hash === hash)?.duration;
        const bounceDuration = validationResult.bounceDuration;

        if (stemDuration && bounceDuration) {
          errorMap.set(
            hash,
            `Duration mismatch: stem is ${stemDuration.toFixed(2)}s, bounce is ${bounceDuration.toFixed(2)}s`,
          );
        } else {
          errorMap.set(hash, "Duration does not match bounce duration");
        }
      });

      previousErrorsRef.current = errorMap;
      return errorMap;
    }

    if (isValidating) {
      return previousErrorsRef.current;
    }

    previousErrorsRef.current = new Map();
    return new Map<string, string>();
  }, [validationResult, isValidating]);

  return {
    allFilesProcessed: shouldValidate,
    isProcessing: !shouldValidate && !!bounceHash && stemHashes.length > 0,
    isAudioValid,
    isValidating,
    validationResult,
    stemErrors,

    bounceHash,
    stemHashes,
  };
}
