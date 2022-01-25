export default interface AsyncValidationOptions {
    /**
     * Run the validators in order. Slower, but will not run validators it doesn't need to.
     */
    sequential?: boolean;
}
