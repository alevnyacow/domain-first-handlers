import { expect, test } from '@rstest/core';
import z from 'zod';
import { defineHandler } from './handler';

const sumPositiveNumbers = defineHandler({
    inputSchema: z.object({
        a: z.number().positive(),
        b: z.number().positive()
    }),
    outputSchema: z.number(),
    handler: ({ a, b }) => a + b
});

test('happy path', async () => {
    const response = await sumPositiveNumbers({ a: 10, b: 20 });
    expect(response.success).toBe(true);
    if (response.success) {
        expect(response.result).toBe(30);
    }
});

test('incorrect data', async () => {
    const response = await sumPositiveNumbers({ a: -10, b: 20 });
    expect(response.success).toBe(false);
    if (!response.success) {
        console.log(response.error);
        expect(response.error).toBeTruthy();
    }
});

test('transformed', async () => {
    const a = sumPositiveNumbers.withTransformation<[number, number], string>({
        input: (a, b) => {
            return {
                a, b
            }
        },
        output: (x) => {
            if (x.success) {
                return x.result.toString()
            }

            return 'error'
        }
    })

    console.log(await a(3, 6))

    expect(true).toBe(true)
})
