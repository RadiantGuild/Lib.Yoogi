import {Validator} from "./validator-types";

export interface LoadingValidateResult {
    src: string;
    isValid: undefined;
    isLoading: true;
    error: undefined;
    promise: Promise<CompleteValidateResult>;

    abort(): void;
}

export interface ValidValidateResult {
    src: string;
    isValid: true;
    isLoading: false;
    error: undefined;
}

export interface InvalidValidateResult {
    src: string;
    isValid: false;
    isLoading: false;

    error: {
        validator: Validator;
        key: string;
        ctx?: unknown;
    };
}

export type CompleteValidateResult =
    | ValidValidateResult
    | InvalidValidateResult;

export type ValidateResult = LoadingValidateResult | CompleteValidateResult;
