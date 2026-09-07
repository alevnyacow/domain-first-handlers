import type {
    StandardJSONSchemaV1,
    StandardSchemaV1
} from '@standard-schema/spec';
import { InputParsingError, OutputParsingError } from '../errors';
import type { Handler, HandlerOutput, Hook } from '../types';

export const defineHandler = <
    InputSchema extends StandardSchemaV1,
    OutputSchema extends StandardSchemaV1
>(params: {
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
    handler: (
        input: StandardSchemaV1.InferInput<InputSchema>
    ) => Promise<StandardSchemaV1.InferInput<OutputSchema>>;
    metadata?: Record<string, string | number | boolean>;
    hooks?: Array<
        Hook<
            StandardJSONSchemaV1.InferOutput<InputSchema>,
            StandardJSONSchemaV1.InferOutput<OutputSchema>
        >
    >;
}): Handler<InputSchema, OutputSchema> => {
    const { handler, inputSchema, outputSchema, hooks, metadata } = params;

    const handlerFunction = async (
        input: StandardSchemaV1.InferOutput<InputSchema>
    ): Promise<HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>> => {
        try {
            const parsedInput = await inputSchema['~standard'].validate(input);
            if (parsedInput.issues) {
                const error = new InputParsingError({
                    issues: parsedInput.issues,
                    value: input,
                    handlerMetadata: params.metadata ?? {}
                });
                try {
                    for (const hook of hooks ?? []) {
                        if (hook.onError) {
                            await hook.onError(error);
                        }
                    }
                } catch {}

                return {
                    success: false,
                    error
                };
            }
            const rawResult = await handler(parsedInput.value);
            const parsedResult =
                await outputSchema['~standard'].validate(rawResult);
            if (parsedResult.issues) {
                const error = new OutputParsingError({
                    issues: parsedResult.issues,
                    value: rawResult,
                    handlerMetadata: params.metadata ?? {}
                });
                try {
                    for (const hook of hooks ?? []) {
                        if (hook.onError) {
                            await hook.onError(error);
                        }
                    }
                } catch {}

                return {
                    success: false,
                    error
                };
            }
            for (const hook of hooks ?? []) {
                if (hook.onSuccess) {
                    try {
                        await hook.onSuccess(parsedInput, parsedResult.value);
                    } catch {}
                }
            }
            return { success: true, result: parsedResult.value };
        } catch (e: unknown) {
            const isError = e instanceof Error;
            const resultError = isError
                ? e
                : new Error(JSON.stringify({ data: e, metadata }));

            for (const hook of hooks ?? []) {
                if (hook.onError) {
                    try {
                        await hook.onError(resultError);
                    } catch {}
                }
            }

            return {
                success: false,
                error: resultError
            };
        }
    };

    const withTransformedContract = <
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
    ) => {
        return async (...input: ParsedInput) => {
            try {
                const requiredInput = await transformers.input(...input);
                const output = await handlerFunction(requiredInput);
                const transformHooksWithErrors =
                    additionalHooks?.transformedHandler?.filter(
                        (x) => x.onError
                    ) ?? [];
                for (const hook of additionalHooks?.handler ?? []) {
                    try {
                        if (output.success && hook.onSuccess) {
                            await hook.onSuccess(requiredInput, output.result);
                        }
                        if (!output.success && hook.onError) {
                            await hook.onError(output.error);
                        }
                    } catch {}
                }
                for (const hook of transformHooksWithErrors) {
                    try {
                        if (!output.success && hook.onError) {
                            await hook.onError(output.error);
                        }
                    } catch {}
                }
                const result = await transformers.output(output, ...input);
                for (const hook of additionalHooks?.transformedHandler ?? []) {
                    if (hook.onSuccess) {
                        try {
                            await hook.onSuccess(input, result);
                        } catch {}
                    }
                }
                return result;
            } catch (e: unknown) {
                const error =
                    e instanceof Error ? e : new Error(JSON.stringify(e));

                for (const hook of additionalHooks?.transformedHandler ?? []) {
                    if (hook.onError) {
                        try {
                            await hook.onError(error);
                        } catch {}
                    }
                }

                return await transformers.output(
                    {
                        error,
                        success: false
                    },
                    ...input
                );
            }
        };
    };

    const unsafe = async (input: StandardSchemaV1.InferInput<InputSchema>) => {
        const result = await handlerFunction(input);
        if (result.success) {
            return result.result;
        }
        throw result.error;
    };

    return Object.assign(handlerFunction, {
        withTransformedContract,
        inputSchema,
        outputSchema,
        unsafe
    });
};
