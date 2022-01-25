# Yoogi

> Tiny validation aggregation library

Yoogi (pronounced with a hard ‘g’) is a tiny validation ‘aggregation’ library. It supports both sync- and asynchronous operation, integrates easily with localisation, and is really easy to use (both for writing validators and using them). It’s also less than half a kilobyte gzipped.

We call Yoogi a validation aggregation library, as it does not supply any validators itself – it lets you supply them, then groups all the results into a single one that you can use.

```js
const uppercaseValidator = /* ... */;
function createMinimumLengthValidator(length) { /* ... */ }

const result = validate("invalid", [
    uppercaseValidator,
    createMinimumLengthValidator(16)
]);

if (isInvalid(result)) {
    console.log("not valid:", result.error);
} else {
    console.log("valid!");
}

// will log something like:
// > not valid: { validator: (valueof uppercaseValidator), message: "it isn't uppercase!" }
```

## Asynchronous validators

Sometimes, you want a validator to be asynchronous (maybe it sends a request off to the backend to check if a username is taken). Yoogi can handle this easily, setting `isLoading` to `true` on the result while any validators are still running. If `isLoading` is true, a `promise` field will also be set that you can use to wait until all validators are complete.

To mark a validator as asynchronous, you should set the field `isAsync` to `true`, and then you can return a promise from the validator function. Yoogi will pass an `AbortSignal` to the validator along with the data, which will be triggered if the user calls `abort()` on a loading validation result.

```js
const serverValidator = {
    // ... base validator stuff, then:
    isAsync: true,
    async validate(src, signal) {
        const response = await fetch("/api/validity", { signal, /* ... */ });
        return response.statusCode === 200;
    }
};

let result = validate("something invalid", [serverValidator]);

isInvalid(result) // false

if (result.isLoading) result = await result.promise;

isInvalid(result) // true
```

## React

> You need React to be installed to use these hooks. You’ll get a module not found error if it isn’t.

Yoogi comes built-in with a React hook, `useValidation`, which you can import from `@radiantguild/yoogi/react`. You don’t have to use it if you don’t want to, but it is there if you do. (You can [view its source](./src/react.ts) to help you implement your own).

The hook takes the source string and validators, just like the normal validate function. The hook will call `validate` initially, and then when either the source or one of the validators changes.

If you use asynchronous validators, the hook will handle this for you, re-rendering your component when the validation completes. If you want to suspend until the data is ready, you can call the `read` property. You also might want to add some delay before showing a loading result to prevent flickering (e.g. using `useTransition`).

```jsx
const serverValidator = /* ... */;

function ValidatedInput({validationResult, value, onChange}) {
    const {isValid, error} = validationResult.read();
    
    return (
        <div>
            <p>{isValid ? "Valid!" : `Invalid: ${error.msg}`}</p>
        	<input value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}

function App() {
    const [value, setValue] = useState("");
    const validationResult = useValidation(value, [serverValidator]);
    
    return (
        // note: don't do it like this irl - the input will disappear as you type
    	<Suspense fallback={<p>Loading...</p>}>
        	<ValidatedInput validationResult={validationResult} value={value} onChange={setValue} />
        </Suspense>
    );
}
```



## API

For more detail, please see the Typescript typing when you download the package.

### Validators

A validator is an object that has the fields:

- `errorMessage`: The message to return if this validator failed. Can also be a localisation message name.
- `validate`: A function that will be called to validate some value. It will be passed a parameter, `src` (the value to validate), and should return true if it is valid and false if it is not. If `isAsync` is true, an abort signal is passed as the second parameter, and the function should return a promise.
- `transCtx`: Optional. Some context that is returned in the validation result, to be used as context for the error message if it is a localisation key.
- `isAsync`: Optional. If true, this is an asynchronous validator (see [above](#asynchronous-validators))

### `validate` function

The validate function takes two parameters, `src` (the string to validate), and `validators`, which is an array of validators (see directly above). When called, it will run the `validate` function in each of these validators. If any of them returns false, the source is considered invalid, and the first failed validator is returned.

The validate function returns the validation result, which has the following properties:

- `src`: The source string passed to the validate function
- `isValid`: If this is true, every validator passed. If it is false, one failed. It can be undefined too, if the result is still loading.
- `isLoading`: If this is true, the validator is still loading. `isValid` and `error` will be undefined, and the `promise`  and `abort` fields will exist.
- `error`: If `isValid` is set to `false`, this will be an object containing:
  - `validator`: The validator that failed (the exact value passed into the array)
  - `msg`: The validator’s error message. The same as `error.validator.errorMessage`.
  - `ctx`: The validator’s translation context, if it has one. The same as `error.validator.transCtx`.
- `promise`: If `isLoading` is set to `true`, this will be a promise that will resolve with a complete validation result (`isLoading` will be set to false), when every async validator has finished loading
- `abort`: A function that takes no parameters, that, when called, will trigger every async validator’s abort signal. They can do what they want with it.

### `useValidation` hook

Passed the same parameters as `validate` (see above). Calls validate once initially and then whenever the source or one of the validators changes. Triggers renders automatically when the validation result changes, including re-calling validate, or when asynchronous validation completes.

Returns the same result as `validate`, but with an extra property `read`, which will suspend rendering of the component in which it is called until the data is ready, and then it will return the data.