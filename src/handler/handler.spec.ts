import { describe, expect, test } from '@rstest/core';
import z from 'zod';
import { InputParsingError } from '../errors';
import { defineHandler } from './handler';

describe('sum positive numbers', () => {
    const handler = defineHandler({
        inputSchema: z.object({
            a: z.number().positive(),
            b: z.number().positive()
        }),
        outputSchema: z.number(),
        handler: async ({ a, b }) => a + b
    });

    describe('with both valid parameters', () => {
        test.each([
            { a: 10, b: 20, expected: 30 },
            { a: 2, b: 1, expected: 3 }
        ])('returns $expected for $a, $b', async ({ a, b, expected }) => {
            const response = await handler({ a, b });

            expect(response.success).toBe(true);

            if (response.success) {
                expect(response.result).toBe(expected);
            }
        });
    });

    describe('with one invalid parameter', () => {
        test.each([
            { a: 0, b: 1 },
            { a: 1, b: 0 }
        ])('returns an input parsing error for $a, $b', async ({ a, b }) => {
            const response = await handler({ a, b });

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toEqual(expect.any(InputParsingError));
            }
        });
    });

    describe('with both invalid parameters', () => {
        test.each([
            { a: 0, b: -1 },
            { a: -1, b: 0 },
            { a: 0, b: 0 },
            { a: -1, b: -1 }
        ])('returns an input parsing error for $a, $b', async ({ a, b }) => {
            const response = await handler({ a, b });

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toEqual(expect.any(InputParsingError));
            }
        });
    });

    describe('transformed', () => {
        const transformedHandler = handler.withTransformedContract<
            [number, number],
            { result: number }
        >({
            input: (a, b) => {
                return { a, b };
            },
            output: (result) => {
                if (result.success) {
                    return { result: result.result };
                }
                throw result.error;
            }
        });

        describe('with valid parameters', () => {
            test.each([
                { parameters: [1, 2], result: 3 },
                { parameters: [20, 10], result: 30 }
            ])('returns { result: $result } for $parameters', async ({
                parameters,
                result
            }) => {
                expect(
                    await transformedHandler(parameters[0], parameters[1])
                ).toEqual({ result });
            });
        });

        describe('with invalid parameters', () => {
            test.each([
                { parameters: [-1, 0] },
                { parameters: [-10, -40] }
            ])('throws an input parsing error for $parameters', async ({
                parameters
            }) => {
                expect(() =>
                    transformedHandler(parameters[0], parameters[1])
                ).rejects.toThrowError(InputParsingError);
            });
        });
    });
});
