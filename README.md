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
const name = await getFullName({ firstName: "John", lastName: "Doe" });

if (!name.success) {
    // type of `name` is { success: false, error: Error }
    throw name.error;
}

// type of `name` is { success: true, result: { fullName: string } }
console.log(name.result); // { fullName: 'John Doe' }
```

# Test coverage

Will be improved in upcoming versions.

| Type       | Threshold | Current value |
| ---------- | --------- | ------------- |
| Statements | 55 %      | 55.26 %       |
| Branches   | 40 %      | 40.78 %       |
| Functions  | 75 %      | 75 %          |
| Lines      | 50 %      | 54.86 %       |
