import type { Request, Response } from 'express';
import { type AdapterTypes, createEndpoint } from '../REST';

const expressAdapter: AdapterTypes.RESTAdapter<
    [req: Request, res: Response],
    void
> = {
    input: {
        queryParams: (x) => x.query,
        body: (x) => x.body,
        cookies: (x) => x.cookies,
        formData: (x) => x.body,
        headers: (x) => x.headers
    },
    output: async (response, _req, res) => {
        if (response.success) {
            if (response.headers) {
                for (const headerData of Object.entries(response.headers)) {
                    res.header(headerData[0], headerData[1]);
                }
            }
            if (response.cookies) {
                for (const cookie of Object.entries(response.cookies)) {
                    res.cookie(cookie[0], cookie[1], { httpOnly: true });
                }
            }
            res.json(response.body);
            return;
        }
        res.send({
            code: response.error.name,
            message: response.error.message
        });
    }
};

export const createExpressEndpoint = createEndpoint(expressAdapter);
