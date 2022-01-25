interface BaseValidator {
    /**
     * The message to return if this validator failed. Can also be a localisation message name.
     */
    errorMessage: string;

    /**
     * Some context that is returned in the validation result, to be used as context for the error message if it is a
     * localisation key.
     */
    transCtx?: unknown;
}

/**
 * Synchronous validator - results are returned instantly
 */
export interface SyncValidator extends BaseValidator {
    isAsync?: false;

    validate(src: string): boolean;
}

/**
 * Asynchronous validator - results are not returned instantly
 */
export interface AsyncValidator extends BaseValidator {
    /**
     * Allows the validator function to statically check if it needs to run asynchronously
     */
    isAsync: true;

    validate(src: string, abort: AbortSignal): Promise<boolean>;
}

/**
 * A validator
 * @remarks Don't use this to type your validator - explicitly specifying if it is sync or not allows `validate`'s return type to skip the loading state if possible.
 */
export type Validator = SyncValidator | AsyncValidator;
