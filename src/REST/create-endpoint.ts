import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Handler } from '../types';
import type { AdapterTypes } from './types';

type SafelyInferOutput<T> = T extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<T>
    : {};

export const createEndpoint =
    <RESTRequest extends unknown[], RESTResponse>(
        adapter: AdapterTypes.RESTAdapter<RESTRequest, RESTResponse>
    ) =>
    <
        InputSchema extends StandardSchemaV1,
        OutputSchema extends StandardSchemaV1
    >(
        handler: Handler<InputSchema, OutputSchema>
    ) => {
        const withContract = <
            RequestQuerySchema extends StandardSchemaV1 | undefined,
            RequestBodySchema extends StandardSchemaV1 | undefined,
            RequestFormDataSchema extends StandardSchemaV1 | undefined,
            RequestHeadersSchema extends StandardSchemaV1 | undefined,
            RequestCookiesSchema extends StandardSchemaV1 | undefined,
            ResponseBody extends StandardSchemaV1 | undefined,
            ResponseHeaders extends StandardSchemaV1 | undefined,
            ResponseCookies extends StandardSchemaV1 | undefined
        >(payload: {
            request: AdapterTypes.APIRequestSchemas<
                InputSchema,
                RequestQuerySchema,
                RequestBodySchema,
                RequestFormDataSchema,
                RequestHeadersSchema,
                RequestCookiesSchema
            >;
            response: AdapterTypes.APIResponseSchemas<
                OutputSchema,
                ResponseBody,
                ResponseHeaders,
                ResponseCookies
            >;
        }) => {
            const withDataMapping = (
                transformers: {
                    inputFromRequest: (
                        x: SafelyInferOutput<RequestBodySchema> &
                            SafelyInferOutput<RequestQuerySchema> &
                            SafelyInferOutput<RequestFormDataSchema> &
                            SafelyInferOutput<RequestHeadersSchema> &
                            SafelyInferOutput<RequestCookiesSchema>
                    ) => StandardSchemaV1.InferOutput<InputSchema>;

                    outputToBody: ResponseBody extends undefined
                        ? undefined
                        : (
                              x: StandardSchemaV1.InferOutput<OutputSchema>
                          ) => SafelyInferOutput<ResponseBody>;
                } & (ResponseCookies extends undefined
                    ? {}
                    : {
                          outputToCookies: (
                              x: StandardSchemaV1.InferOutput<OutputSchema>
                          ) => SafelyInferOutput<ResponseCookies>;
                      }) &
                    (ResponseCookies extends undefined
                        ? {}
                        : {
                              outputToHeaders: (
                                  x: StandardSchemaV1.InferOutput<OutputSchema>
                              ) => SafelyInferOutput<ResponseHeaders>;
                          })
            ) => {
                const requestSchemas = payload.request(handler.inputSchema);
                const responseSchemas = payload.response?.(
                    handler.outputSchema
                ) ?? {
                    body: handler.outputSchema
                };

                const transformedREST = handler.withTransformedContract<
                    RESTRequest,
                    RESTResponse
                >({
                    input: async (...input) => {
                        let result: Object = {};

                        /**
                         * Query parameters parsing if needed.
                         */
                        if ('query' in requestSchemas && requestSchemas.query) {
                            const queryParameters =
                                await adapter.input.queryParams(...input);

                            const parsedQueryParameters =
                                await requestSchemas.query[
                                    '~standard'
                                ].validate(queryParameters);

                            if (parsedQueryParameters.issues) {
                                throw new Error();
                            }

                            result = {
                                ...result,
                                ...(parsedQueryParameters.value as object)
                            };
                        }

                        /**
                         * Body parsing if needed.
                         */
                        if ('body' in requestSchemas && requestSchemas.body) {
                            const body = await adapter.input.body(...input);
                            const parsedBody =
                                await requestSchemas.body['~standard'].validate(
                                    body
                                );
                            if (parsedBody.issues) {
                                throw new Error();
                            }
                            result = {
                                ...result,
                                ...(parsedBody.value as object)
                            };
                        }

                        /**
                         * FormData parsing if needed.
                         */
                        if (
                            'formData' in requestSchemas &&
                            requestSchemas.formData
                        ) {
                            const formData = await adapter.input.formData(
                                ...input
                            );
                            const parsedFormData =
                                await requestSchemas.formData[
                                    '~standard'
                                ].validate(formData);

                            if (parsedFormData.issues) {
                                throw new Error();
                            }

                            result = {
                                ...result,
                                ...(parsedFormData.value as object)
                            };
                        }

                        /**
                         * Headers parsing if needed.
                         */
                        if (
                            'headers' in requestSchemas &&
                            requestSchemas.headers
                        ) {
                            const headers = await adapter.input.headers(
                                ...input
                            );
                            const parsedHeaders =
                                await requestSchemas.headers[
                                    '~standard'
                                ].validate(headers);
                            if (parsedHeaders.issues) {
                                throw new Error();
                            }
                            result = {
                                ...result,
                                ...(parsedHeaders.value as object)
                            };
                        }

                        /**
                         * Cookies parsing if needed.
                         */
                        if (
                            'cookies' in requestSchemas &&
                            requestSchemas.cookies
                        ) {
                            const cookies = await adapter.input.cookies(
                                ...input
                            );
                            const parsedCookies =
                                await requestSchemas.cookies[
                                    '~standard'
                                ].validate(cookies);
                            if (parsedCookies.issues) {
                                throw new Error();
                            }
                            result = {
                                ...result,
                                ...(parsedCookies.value as object)
                            };
                        }

                        const output = await handler.inputSchema[
                            '~standard'
                        ].validate(
                            transformers.inputFromRequest(
                                result as unknown as any
                            )
                        );

                        if (output.issues) {
                            throw new Error();
                        }

                        return output.value;
                    },
                    output: async (response, ...input) => {
                        if (!response.success) {
                            return await adapter.output(
                                {
                                    success: false,
                                    error: response.error
                                },
                                ...input
                            );
                        }

                        const getBodyPart = async () => {
                            if (
                                'body' in responseSchemas &&
                                responseSchemas.body
                            ) {
                                const result = await responseSchemas.body[
                                    '~standard'
                                ].validate(
                                    transformers.outputToBody!(response.result)
                                );
                                if (result.issues) {
                                    throw new Error();
                                }
                                return result.value as any;
                            }

                            return undefined;
                        };

                        const getCookiesPart = async () => {
                            if (
                                'cookies' in responseSchemas &&
                                responseSchemas.cookies &&
                                'outputToCookies' in transformers
                            ) {
                                const result = await responseSchemas.cookies[
                                    '~standard'
                                ].validate(
                                    transformers.outputToCookies!(
                                        response.result
                                    )
                                );
                                if (result.issues) {
                                    throw new Error();
                                }
                                return result.value as object;
                            }

                            return undefined;
                        };

                        const getHeadersPart = async () => {
                            if (
                                'headers' in responseSchemas &&
                                responseSchemas.headers &&
                                'outputToHeaders' in transformers
                            ) {
                                const result = await responseSchemas.headers[
                                    '~standard'
                                ].validate(
                                    transformers.outputToHeaders!(
                                        response.result
                                    )
                                );
                                if (result.issues) {
                                    throw new Error();
                                }
                                return response.result as object;
                            }

                            return undefined;
                        };

                        return await adapter.output(
                            {
                                body: await getBodyPart(),
                                cookies: await getCookiesPart(),
                                headers: await getHeadersPart(),
                                success: true
                            },
                            ...input
                        );
                    }
                });

                return Object.assign(transformedREST, {
                    _api_schemas: {
                        requestSchemas,
                        responseSchemas
                    }
                });
            };

            return { withDataMapping };
        };

        return { withContract };
    };
