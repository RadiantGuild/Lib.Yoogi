import AsyncValidationOptions from "./AsyncValidationOptions";
import {
    getInvalidResult,
    getLoadingResult,
    getValidResult
} from "./get-results";
import {CompleteValidateResult} from "./validation-results";
import {AsyncValidator, Validator} from "./validator-types";

export function validateAsync(
    src: string,
    validators: readonly Validator[],
    opts?: AsyncValidationOptions
) {
    const abortController = new AbortController();

    const promise = opts?.sequential
        ? doSequentialValidateAsync(
              src,
              validators.slice(),
              abortController.signal
          )
        : doParallelValidateAsync(src, validators.slice(), abortController);

    return getLoadingResult(src, promise, abortController);
}

class FailedAsyncValidation {
    constructor(public readonly validator: Validator) {}
}

async function doSequentialValidateAsync(
    src: string,
    validators: readonly Validator[],
    signal: AbortSignal
): Promise<CompleteValidateResult> {
    for (const validator of validators) {
        const result = await runMaybeAsyncValidator(src, validator, signal);
        if (!result) return getInvalidResult(src, validator);
    }

    return getValidResult(src);
}

async function doParallelValidateAsync(
    src: string,
    validators: readonly Validator[],
    abortController: AbortController
): Promise<CompleteValidateResult> {
    try {
        await Promise.all(
            validators.map(async validator => {
                const result = await runMaybeAsyncValidator(
                    src,
                    validator,
                    abortController.signal
                );

                if (result) return;
                throw new FailedAsyncValidation(validator);
            })
        );

        return getValidResult(src);
    } catch (err) {
        if (err instanceof FailedAsyncValidation) {
            abortController.abort();
            return getInvalidResult(src, err.validator);
        } else {
            throw err;
        }
    }
}

function runMaybeAsyncValidator(
    src: string,
    validator: Validator,
    signal: AbortSignal
) {
    if (validator.isAsync === true) {
        return validator.validate(src, signal);
    } else {
        return Promise.resolve(validator.validate(src));
    }
}
