import type { StandardSchemaV1 } from '@standard-schema/spec';

type InferRequestQuery<T> = T extends {
    _api_schemas: {
        requestSchemas: { query: infer Query extends StandardSchemaV1 };
    };
}
    ? { query: StandardSchemaV1.InferOutput<Query> }
    : {};

type InferRequestBody<T> = T extends {
    _api_schemas: {
        requestSchemas: { body: infer Body extends StandardSchemaV1 };
    };
}
    ? { body: StandardSchemaV1.InferOutput<Body> }
    : {};

type InferRequestCookies<T> = T extends {
    _api_schemas: {
        requestSchemas: { cookies: infer Cookies extends StandardSchemaV1 };
    };
}
    ? { cookie: StandardSchemaV1.InferOutput<Cookies> }
    : {};

type InferRequestFormData<T> = T extends {
    _api_schemas: {
        requestSchemas: { formData: infer FormData extends StandardSchemaV1 };
    };
}
    ? { formData: StandardSchemaV1.InferOutput<FormData> }
    : {};

type InferRequestHeaders<T> = T extends {
    _api_schemas: {
        requestSchemas: { headers: infer Headers extends StandardSchemaV1 };
    };
}
    ? { headers: StandardSchemaV1.InferOutput<Headers> }
    : {};

type InferResponseBody<T> = T extends {
    _api_schemas: {
        responseSchemas: { body: infer Body extends StandardSchemaV1 };
    };
}
    ? { body: StandardSchemaV1.InferOutput<Body> }
    : {};

type InferResponseHeaders<T> = T extends {
    _api_schemas: {
        responseSchemas: { headers: infer Headers extends StandardSchemaV1 };
    };
}
    ? { headers: StandardSchemaV1.InferOutput<Headers> }
    : {};

type InferResponseCookies<T> = T extends {
    _api_schemas: {
        responseSchemas: { cookies: infer Cookies extends StandardSchemaV1 };
    };
}
    ? { cookies: StandardSchemaV1.InferOutput<Cookies> }
    : {};

export type Request<T extends { _api_schemas: object }> = InferRequestQuery<T> &
    InferRequestBody<T> &
    InferRequestCookies<T> &
    InferRequestFormData<T> &
    InferRequestHeaders<T>;

export type Response<T extends { _api_schemas: object }> =
    InferResponseBody<T> & InferResponseCookies<T> & InferResponseHeaders<T>;
