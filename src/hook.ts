import {useCallback, useDebugValue, useEffect, useMemo, useState} from "react";
import {useDeepCompareMemoize} from "use-deep-compare-effect";
import AsyncValidationOptions from "./AsyncValidationOptions";
import {validate} from "./validate";
import {CompleteValidateResult, ValidateResult} from "./validation-results";
import {SyncValidator, Validator} from "./validator-types";

export type ValidateHookResult = ValidateResult & {
    read(): CompleteValidateResult;
};

export interface ValidateHook {
    (
        src: string,
        validators: readonly SyncValidator[],
        opts?: Record<string, never>
    ): CompleteValidateResult;

    (
        src: string,
        validators: readonly Validator[],
        opts?: AsyncValidationOptions
    ): ValidateHookResult;
}

export const useValidation: ValidateHook = ((
    src: string,
    validators: Validator[],
    opts?: AsyncValidationOptions
): ValidateHookResult => {
    const optsMemo = useDeepCompareMemoize(opts);

    const doValidate = useCallback(
        () => validate(src, validators, optsMemo),
        [src, optsMemo, ...validators]
    );

    const [result, setResult] = useState(() => doValidate());

    useDebugValue(result, res =>
        res.isValid
            ? "valid"
            : res.isLoading
            ? "loading"
            : `invalid: ${res.error.key}`
    );

    const read = useCallback(() => {
        if (result.isLoading === true) throw result.promise;
        return result;
    }, [result]);

    useEffect(() => {
        const validateResult = doValidate();
        setResult(validateResult);

        return () => {
            if (validateResult.isLoading) validateResult.abort();
        };
    }, [setResult, doValidate]);

    useEffect(() => {
        if (!result.isLoading) return;

        let enabled = true;
        result.promise.then(
            updatedResult => enabled && setResult(updatedResult)
        );

        return () => {
            enabled = false;
        };
    }, [result, setResult]);

    return useMemo<ValidateHookResult>(
        () => ({
            ...result,
            read
        }),
        [result, read]
    );
}) as ValidateHook;
