import { expect, test } from '@rstest/core';

test('sup', () => {
    expect(true).toBe(true);
});

// test("Next adapter", async () => {
//     const NextRoute = upperCase
//         .REST(nextAdapter)
//         .customSchema(({ pick, omit }) => {
//             return {
//                 bodySchema: pick({ secondString: true }),
//                 querySchema: omit({ secondString: true }),
//             };
//         });

//     type A = EndpointContracts<typeof NextRoute>;

//     const data = await NextRoute(
//         new NextRequest("http://localhost.mock.url:3000?string=hello", {
//             body: JSON.stringify({ secondString: "world" }),
//             method: "POST",
//         }),
//     );
//     const body = await data.json();
//     expect(body).toEqual({ stringInUpperCase: "HELLO WORLD" });
// });
