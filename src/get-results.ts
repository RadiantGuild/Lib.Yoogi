import {
    CompleteValidateResult,
    InvalidValidateResult,
    LoadingValidateResult,
    ValidValidateResult
} from "./validation-results";
import {Validator} from "./validator-types";

export function getInvalidResult(
    src: string,
    validator: Validator
): InvalidValidateResult {
    return {
        src,
        isValid: false,
        isLoading: false,
        error: {
            validator,
            key: validator.errorMessage,
            ctx: validator.transCtx
        }
    };
}

export function getValidResult(src: string): ValidValidateResult {
    return {
        src,
        isValid: true,
        isLoading: false,
        error: undefined
    };
}

export function getLoadingResult(
    src: string,
    promise: Promise<CompleteValidateResult>,
    abortController: AbortController
): LoadingValidateResult {
    return {
        src,
        isLoading: true,
        isValid: undefined,
        error: undefined,
        promise,
        abort() {
            abortController.abort();
        }
    };
}
