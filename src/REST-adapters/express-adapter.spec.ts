import { expect, test } from '@rstest/core';
import express from 'express';
import z from 'zod';
import { defineHandler } from '../../src';
import { createExpressEndpoint } from './express-adapter';

const countWordsUseCase = defineHandler({
    inputSchema: z.object({ word: z.string() }),
    outputSchema: z.object({ letters: z.number() }),
    handler: async (x) => {
        return { letters: x.word.length };
    },
    metadata: {
        source: 'count-words use-case'
    }
});

test('Express adapter', async () => {
    const app = express();

    const expressEndpoint = createExpressEndpoint(countWordsUseCase)
        .contract({
            request: (inputSchema) => ({
                query: inputSchema
            }),
            response: (outputSchema) => ({
                body: outputSchema
            })
        })
        .mapData({
            inputFromRequest: (x) => x,
            outputToBody: (x) => x
        });

    app.get('/', expressEndpoint);

    const server = await new Promise<ReturnType<typeof app.listen>>(
        (resolve) => {
            const s = app.listen(0, () => resolve(s));
        }
    );

    const port = (server.address() as any).port;

    const result = await fetch(`http://localhost:${port}/?word=4124`);

    const json = await result.json();
    const jsonh = result.headers;

    console.log(jsonh);
    expect(json).toEqual({ letters: 4 });

    // const result2 = await fetch(
    //     `http://localhost:${port}?string=THROW_ERROR&secondString=world`,
    // );

    // const status = result2.status;

    // expect(status).toBe(404);

    server.close();
});

// import { expect, test } from "@rstest/core";
// import { handler, handlerWithCtx } from "../src/handler";
// import z from "zod";
// import { NextRequest } from "next/server";
// import { nextAdapter } from "../src/next";
// import express from "express";
// import { expressAdapter } from "../src/express";
// import {
//     ControllerContracts,
//     EndpointContracts,
// } from "../src/api-adapter-types";
// import { newContainer } from "@stompbox/tape-delay";
// import { enrichDetails, Limiter } from "@stompbox/limiter";

// const TestError = Limiter({
//     test: {
//         defaultDetails: enrichDetails.withResponseStatusCode(404)(),
//         name: "not_found",
//     },
// });

// const upperCase = handler({
//     input: z.object({ string: z.string(), secondString: z.string() }),
//     output: z.object({ stringInUpperCase: z.string() }),
//     handler: ({ secondString, string }) => {
//         if (string === "THROW_ERROR") {
//             throw new TestError("test");
//         }
//         return {
//             stringInUpperCase: `${string.toUpperCase()} ${secondString.toUpperCase()}`,
//         };
//     },
//     middlewares: {
//         beforeHandler: [
//             async ({ context, parsedInput }) => {
//                 console.log(context, parsedInput);
//             },
//         ],
//         afterHandler: [
//             async ({ context, output, parsedInput }) => {
//                 console.log("after", context, output, parsedInput);
//             },
//         ],
//         onError: [
//             async (x) => {
//                 console.error("ERROR HAPPENED", x);
//             },
//         ],
//     },
// });

// test("Tape delay", async () => {
//     class RandomNumber {
//         getNumber = () => Math.random();
//     }
//     const container = newContainer({ RandomNumber });

//     const randomNumberGenerator = handlerWithCtx({
//         input: z.number(),
//         output: z.number(),
//         handler: (i, ctx: { randomNumber: RandomNumber }) =>
//             i + ctx.randomNumber.getNumber(),
//     });

//     const f = randomNumberGenerator(container.resolve);

//     const result = await f.orThrow(2);

//     expect(result).toBeGreaterThan(2);
//     expect(result).toBeLessThan(3);
// });
