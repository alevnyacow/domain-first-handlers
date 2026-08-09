import { errorNamespace } from '@domain-first/errors';
import type { StandardSchemaV1 } from '@standard-schema/spec';

const Errors = errorNamespace('@domain-first/errors');

export const InputParsingError = Errors.define<{
    issues: readonly StandardSchemaV1.Issue[];
    value: unknown;
}>('INPUT_PARSING');
