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

# Quick Start

```ts
import { defineHandler } from "@domain-first/handlers";
// any Standard Schema compatible library can be used
import z from "zod";

const inputSchema = z.object({
    a: z.number().positive(),
    b: z.number().positive(),
});

const outputSchema = z.number();

const sumPositiveNumbers = defineHandler({
    inputSchema,
    outputSchema,
    handler: ({ a, b }) => a + b,
});

const main = async () => {
    const response = await sumPositiveNumbers({ a: 10, b: 20 });
    if (response.success) {
        // 30
        console.log(response.result);
    }
};

main();
```

# Examples

## `withTransformedContract`

```ts
import { defineHandler } from "@domain-first/handlers";
import z from "zod";

const getStringLength = defineHandler({
    inputSchema: z.string(),
    outputSchema: z.number(),
    handler: (x) => x.length,
});

const getFullNameLength = getStringLength.withTransformedContract<
    [string, string],
    number
>({
    input: (firstName, secondName) => {
        return [firstName, secondName].join("");
    },
    output: (x) => {
        if (x.success) {
            return x.result;
        }

        throw x.error;
    },
});
```
