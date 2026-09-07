import type {
    StandardJSONSchemaV1,
    StandardSchemaV1
} from '@standard-schema/spec';

export type HandlerOutput<T> =
    | { success: true; result: T }
    | { success: false; error: Error };

export type Hook<Parameters, Result> = {
    onError?: (e: Error) => void | Promise<void>;
    onSuccess?: (input: Parameters, result: Result) => void | Promise<void>;
};

export interface Handler<
    InputSchema extends StandardSchemaV1,
    OutputSchema extends StandardSchemaV1
> {
    (
        input: StandardSchemaV1.InferInput<InputSchema>
    ): Promise<HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>>;
    unsafe: (
        input: StandardSchemaV1.InferInput<InputSchema>
    ) => Promise<StandardSchemaV1.InferOutput<OutputSchema>>;
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
    withTransformedContract: <
        ParsedInput extends unknown[] = [
            StandardSchemaV1.InferInput<InputSchema>
        ],
        ParsedOutput = HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>
    >(
        transformers: {
            input: (
                ...input: ParsedInput
            ) =>
                | StandardSchemaV1.InferOutput<InputSchema>
                | Promise<StandardSchemaV1.InferOutput<InputSchema>>;
            output: (
                output: HandlerOutput<
                    StandardSchemaV1.InferOutput<OutputSchema>
                >,
                ...input: ParsedInput
            ) => ParsedOutput | Promise<ParsedOutput>;
        },
        additionalHooks?: {
            handler?: Array<
                Hook<
                    StandardJSONSchemaV1.InferOutput<InputSchema>,
                    StandardJSONSchemaV1.InferOutput<OutputSchema>
                >
            >;
            transformedHandler?: Array<Hook<ParsedInput, ParsedOutput>>;
        }
    ) => (...input: ParsedInput) => Promise<ParsedOutput>;
}
