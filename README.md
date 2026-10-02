<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-handlers/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    <b>Write your business logic once. Call it from anywhere.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40domain-first%2Fhandlers" alt="version">
  <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release" alt="semver">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Fhandlers" alt="license">
</p>

```bash
npm i @domain-first/handlers
```

## The idea in 10 seconds

You describe a use case as a **handler**: what comes in, what goes out, and what happens in between.

```ts
import { defineHandler } from "@domain-first/handlers";
import z from "zod";

const createUser = defineHandler({
    inputSchema: z.object({
        email: z.email(),
        name: z.string().min(1),
    }),
    outputSchema: z.object({ id: z.string() }),
    handler: async ({ email, name }) => {
        const user = await db.users.insert({ email, name });
        return { id: user.id };
    },
});
```

And you get back a plain async function that you can call from **anywhere** — a route, a server action, a CLI, a queue worker, a test:

```ts
const result = await createUser({
    email: "john@doe.com",
    name: "John",
});

if (result.success) {
    console.log(result.result.id); // fully typed
} else {
    console.error(result.error); // never throws
}
```

That's it. No framework, no classes, no decorators.

## What you get for free

- ✅ **Input is validated** before your code runs — no more `if (!body.email)` in every route.
- ✅ **Output is validated** too — you never accidentally leak a field you didn't mean to return.
- ✅ **Fully typed** end to end, inferred from your schemas.
- ✅ **No try/catch needed** — errors come back as values, not exceptions.
- ✅ **Not tied to any framework** — Express today, Next.js tomorrow, the logic doesn't change.
- ✅ **Any schema library** — Zod, Valibot, ArkType or anything else that supports [Standard Schema](https://standardschema.dev).

## Before / after

**Before:** logic is glued to the framework, validation is copy‑pasted, and you can't reuse it anywhere else.

```ts
app.post("/users", async (req, res) => {
    if (!req.body.email || !req.body.name) {
        return res.status(400).send("Bad request");
    }
    try {
        const user = await db.users.insert(req.body);
        res.json({ id: user.id });
    } catch (e) {
        res.status(500).send("Oops");
    }
});
```

**After:** the logic lives in one place, the route is just a thin adapter.

```ts
app.post("/users", async (req, res) => {
    const result = await createUser(req.body);
    result.success
        ? res.json(result.result)
        : res.status(400).json(result.error);
});
```

…and the very same `createUser` works in a Next.js server action, a cron job or a unit test.

## Prefer exceptions? Use `.unsafe`

```ts
const { id } = await createUser.unsafe({
    email: "john@doe.com",
    name: "John",
});
// throws if something goes wrong
```

## Know exactly what went wrong

Validation failures come back as typed errors, so you can tell "bad input" from "bug in my code":

```ts
import { InputParsingError } from "@domain-first/handlers";

const result = await createUser({
    email: "not-an-email",
    name: "",
});

if (!result.success && InputParsingError.is(result.error)) {
    // what exactly is wrong with the input
    console.log(result.error.details.issues);
}
```

## Hooks: logging and metrics in one line

```ts
const createUser = defineHandler({
    // ...schemas and handler
    // attached to validation errors
    metadata: { name: "createUser" },
    hooks: [
        {
            onSuccess: (input, output) => {
                logger.info(`${input.email} → ${output.id}`);
            },
            onError: (error) => logger.error(error),
        },
    ],
});
```

Hooks never break your handler — if a hook throws, it is ignored.

## Fit the handler to any call site

Need a different signature somewhere? Wrap the handler without touching its logic:

```ts
// from (input) => Result<{ id }>
// to   (email, name) => string
const createUserAndGetId = createUser.withTransformedContract<
    [email: string, name: string],
    string
>({
    input: (email, name) => ({ email, name }),
    output: (result) => {
        if (result.success) return result.result.id;
        throw result.error;
    },
});

const id = await createUserAndGetId("john@doe.com", "John");
```

This is how adapters for HTTP, RPC and other transports are built.

## REST in one step

Want to expose handlers as REST endpoints? Use [@domain-first/handlers-rest](https://www.npmjs.com/package/@domain-first/handlers-rest).

## License

MIT
