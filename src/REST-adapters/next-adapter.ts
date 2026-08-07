import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import type { AdapterTypes } from '../REST';

/**
 * Plain `jsonResponse` working without NextResponse extension.
 *
 * @param data response data
 * @param init response initialization
 * @returns Response object can be sent to a client
 */
function jsonResponse<T>(data: T, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
        }
    }) as any;
}

const nextAdapter: AdapterTypes.RESTAdapter<
    [request: NextRequest],
    NextResponse
> = {
    input: {
        body: (x) => x.json(),
        queryParams: (x) =>
            Object.fromEntries(x.nextUrl.searchParams.entries()),
        cookies: (x) =>
            x.cookies.getAll().reduce(
                (acc, cur) => {
                    acc[cur.name] = cur.value;
                    return acc;
                },
                {} as Record<string, string>
            ),
        formData: (x) => x.formData(),
        headers: (x) => Object.fromEntries(x.headers.entries())
    },

    output: async (x) => {
        if (x.success) {
            if (x.cookies) {
                const cookiesProvider = await cookies();
                for (const cookie of Object.entries(x.cookies)) {
                    cookiesProvider.set(cookie[0], cookie[1]);
                }
            }

            return jsonResponse(x.body, {
                headers: x.headers ?? {}
            });
        }

        return jsonResponse(
            { code: x.error.name, message: x.error.message },
            { status: 500 }
        );
    }
};

export default nextAdapter;
