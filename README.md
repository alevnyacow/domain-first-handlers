<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-handlers/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Framework-agnostic application handlers.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40domain-first%2Fhandlers" alt="version">
  <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Fhandlers" alt="license">
</p>

# Motivation

Business logic shouldn't depend on HTTP, Express, Next.js, or any other transport.

This library lets you define your use cases once as **handlers** with validated input and output, then reuse them anywhere: call them directly from your application, expose them as REST endpoints, or plug them into other transports without rewriting the business logic.

# Quick Start

## Defining a handler

```ts
import { defineHandler } from "@domain-first/handlers";
// any Standard Schema compatible library can be used
import z from "zod";

const inputSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
});

const outputSchema = z.string();

const getFullName = defineHandler({
    inputSchema,
    outputSchema,
    handler: ({ firstName, lastName }) => `${firstName} ${lastName}`,
});
```

## Using it as a function

```ts
// type of `name` is
// | { success: false, error: Error }
// | { success: true, result: string }
const name = await getFullName({ firstName: "John", lastName: "Doe" });

if (!name.success) {
    // type of `name` is { success: false, error: Error }
    throw name.error;
}

// type of `name` is { success: true, result: string }
console.log(name.result); // John Doe
```

## Using handlers as REST endpoints (Express usage)

```ts
import express from "express";
import { createEndpoint } from "@domain-first/handlers";
import adapter from "@domain-first/handlers/express-adapter";

const createExpressEndpoint = createEndpoint(adapter);

const fullName_GET = createExpressEndpoint(getFullName)
    // define contract of an endpoint based on handler contracts
    .withContract({
        request: (
            // handler input schema
            inputSchema,
        ) => ({
            // all data will be received as query parameters
            query: inputSchema,
        }),
        response: (
            // handler output schema
            outputSchema,
        ) => ({
            // full handler response will be sent in response body,
            // let's modify it a bit for an example purpose
            body: z.object({ fullName: outputSchema }),
        }),
    })
    // describe how endpoint data and handler data map into each other
    .withDataMapping({
        // how to get handler input from endpoint request
        inputFromRequest: (x) => x,
        // how to get handler response body from handler output
        outputToBody: (x) => ({ fullName: x }),
    });

const app = express();
app.get("/full-name", fullName_GET);
app.listen(3000);

/**
 * GET localhost:3000/full-name?firstName=John&lastName=Doe
 *
 * Response: { fullName: "John Doe" }
 */
```
