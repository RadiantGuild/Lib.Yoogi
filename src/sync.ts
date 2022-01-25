import {getInvalidResult, getValidResult} from "./get-results";
import {CompleteValidateResult} from "./validation-results";
import {SyncValidator} from "./validator-types";

export function validateSync(
    src: string,
    validators: readonly SyncValidator[]
): CompleteValidateResult {
    for (const validator of validators) {
        if (!validator.validate(src)) {
            return getInvalidResult(src, validator);
        }
    }

    return getValidResult(src);
}
