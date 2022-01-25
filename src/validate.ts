import AsyncValidationOptions from "./AsyncValidationOptions";
import {validateAsync} from "./async";
import {validateSync} from "./sync";
import {CompleteValidateResult, ValidateResult} from "./validation-results";
import {SyncValidator, Validator} from "./validator-types";

export interface ValidateFunction {
    (
        src: string,
        validators: readonly SyncValidator[],
        opts?: Record<string, never>
    ): CompleteValidateResult;

    (
        src: string,
        validators: readonly Validator[],
        opts?: AsyncValidationOptions
    ): ValidateResult;
}

export const validate: ValidateFunction = ((
    src: string,
    validators: readonly Validator[],
    opts?: AsyncValidationOptions
): ValidateResult => {
    if (validators.some(it => it.isAsync)) {
        return validateAsync(src, validators, opts);
    } else {
        return validateSync(src, validators as SyncValidator[]);
    }
}) as ValidateFunction;
