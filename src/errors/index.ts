import { errorNamespace } from '@domain-first/errors';
import type { StandardSchemaV1 } from '@standard-schema/spec';

const Errors = errorNamespace('@domain-first/errors');

export const InputParsingError = Errors.define<{
    issues: readonly StandardSchemaV1.Issue[];
    value: unknown;
    handlerMetadata: Record<string, string | number | boolean>;
}>('INPUT_PARSING');

export const OutputParsingError = Errors.define<{
    issues: readonly StandardSchemaV1.Issue[];
    value: unknown;
    handlerMetadata: Record<string, string | number | boolean>;
}>('OUTPUT_PARSING');

/**
 * Case when handler caught an exception and this exception
 * was not instance of an error. In that case `NonErrorException`
 * will be returned as an Error.
 */
export const NonErrorException = Errors.define<{
    data: unknown;
    handlerMetadata: Record<string, string | number | boolean>;
}>('NON_ERROR_EXCEPTION');
