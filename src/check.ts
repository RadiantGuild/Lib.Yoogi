import {InvalidValidateResult, ValidateResult} from "./validation-results";

/**
 * @returns true if the type is not valid and it is not loading, false otherwise
 * @remarks Use this function instead of checking `!result.isValid`, as this would say it is invalid when it is still loading
 */
export function isInvalid(result: ValidateResult): result is InvalidValidateResult {
    return !result.isValid && !result.isLoading;
}
