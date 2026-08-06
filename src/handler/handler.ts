import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Handler, HandlerOutput } from '../types';

export const defineHandler = <
    InputSchema extends StandardSchemaV1,
    OutputSchema extends StandardSchemaV1
>(params: {
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
    handler: (
        input: StandardSchemaV1.InferInput<InputSchema>
    ) => Promise<StandardSchemaV1.InferOutput<OutputSchema>> | StandardSchemaV1.InferOutput<OutputSchema>;
    metadata?: Record<string, string | number | boolean>;
}): Handler<InputSchema, OutputSchema> => {
    const { handler, inputSchema, outputSchema } = params;

    const handlerFunction = async (
        input: StandardSchemaV1.InferInput<InputSchema>
    ): Promise<HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>> => {
        try {
            const parsedInput = await inputSchema['~standard'].validate(input);
            if (parsedInput.issues) {
                return {
                    success: false,
                    error: new Error()
                };
            }
            const rawResult = await handler(parsedInput.value);
            const parsedResult = await outputSchema['~standard'].validate(rawResult);
            if (parsedResult.issues) {
                return {
                    success: false,
                    error: new Error()
                };
            }
            return { success: true, result: parsedResult.value };
        } catch (e: unknown) {
            return {
                success: false,
                error: e instanceof Error ? e : new Error(JSON.stringify(e))
            };
        }
    };

    const withTransformation = <
        ParsedInput extends unknown[] = [StandardSchemaV1.InferInput<InputSchema>],
        ParsedOutput = HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>
    >(transformers: {
        input: (
            ...input: ParsedInput
        ) => StandardSchemaV1.InferOutput<InputSchema> | Promise<StandardSchemaV1.InferOutput<InputSchema>>;
        output: (
            output: HandlerOutput<StandardSchemaV1.InferOutput<OutputSchema>>,
            ...input: ParsedInput
        ) => ParsedOutput | Promise<ParsedOutput>;
    }) => {
        return async (...input: ParsedInput) => {
            const requiredInput = await transformers.input(...input);
            const output = await handlerFunction(requiredInput);
            return await transformers.output(output, ...input);
        };
    };

    return Object.assign(handlerFunction, {
        withTransformation,
        inputSchema,
        outputSchema
    });
};
