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

const getFullName = defineHandler({
    inputSchema: z.object({
        firstName: z.string(),
        lastName: z.string(),
    }),
    outputSchema: z.object({ fullName: z.string() }),
    handler: async ({ firstName, lastName }) => {
        const fullName = `${firstName} ${lastName}`;
        return { fullName };
    },
});
```

## Using it as a function

### Unsafe (can throw an Error)

```ts
try {
    const name = await getFullName.unsafe({
        firstName: "John",
        lastName: "Doe",
    });
    console.log(name); // { fullName: "John Doe" }
} catch (e: unknown) {
    console.log(e);
}
```

### Safe (returns a Result instead of throwing)

```ts
// type of `name` is
// | { success: false, error: Error }
// | { success: true, result: { fullName: string } }
const name = await getFullName({
    firstName: "John",
    lastName: "Doe",
});

if (!name.success) {
    // type of `name` is { success: false, error: Error }
    throw name.error;
}

// type of `name` is { success: true, result: { fullName: string } }
console.log(name.result); // { fullName: 'John Doe' }
```

## Using it as a function with another contract

```ts
type User = { name: string; lastName: string };

const getUserFullName = getFullName.withTransformedContract<
    // transformed handler input parameters
    [User],
    // transformed handler output
    string
>({
    input: (user) => {
        return { firstName: user.name, lastName: user.lastName };
    },
    output: (response) => {
        if (response.success) {
            return response.result.fullName;
        }
        throw response.error;
    },
});

const johnDoe: User = { name: "John", lastName: "Doe" };
// "John Doe"
const userFullName = await getUserFullName(johnDoe);
```

# Usage with REST

Use [@domain-first/handlers-rest](https://www.npmjs.com/package/@domain-first/handlers-rest) package.
