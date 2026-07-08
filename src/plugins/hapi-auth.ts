import Boom from "@hapi/boom";
import { Plugin, Request, ResponseObject, Server } from "@hapi/hapi";
import * as hapiAuthJwt2 from "hapi-auth-jwt2";
import { JwksRateLimitError, SigningKeyNotFoundError } from "jwks-rsa";
import * as jwksRsa from "jwks-rsa";
import lodash from "lodash";

export enum AuthStrategy {
    AUTH0 = "auth0",
    JWT = "jwt",
}

const HEADER_KEY = "authorization";
const TOKEN_TYPE = "bearer";

function responseFunc(request: Request) {
    const token = lodash.get(request, "auth.token");

    if (!lodash.isNil(token)) {
        const res = request.response as ResponseObject;
        res.header("Authorization", `Bearer ${token}`);
    }
}

interface TokenHeader {
    readonly alg: string;
    readonly kid: string;
}

interface TokenPayload {
    readonly scope?: string | string[];
}

/** {@link jwksRsa.DecodedToken} */
interface DecodedToken {
    readonly header: TokenHeader;
}

/** creates a HapiJS key provider. exported for mocking */
export const createJwksKeyProvider = (jwksUri: string) =>
    jwksRsa.hapiJwt2KeyAsync({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2, // defaults to 10
        cacheMaxAge: 86_400_000, // 24 hours, defaults to 10 minutes
        cacheMaxEntries: 10, // defaults to 5
        jwksUri,
    });

/**
 * Retrieves the public key based on the decoded token. The `complete` option must be set to true when configuring the
 * hapi-auth-jwt2 plugin in order for the `kid` header to come through.
 * @param {string} jwksUri - uri to fetch public keys from
 */
export const getKeyProvider = (jwksUri: string): ((jwt: DecodedToken) => Promise<{ key: string }>) => {
    // declare OUTSIDE the returned key provider function to make only one.
    const jwksFn = createJwksKeyProvider(jwksUri);

    // handle errors coming from the jwks client. Needs to be mapped to proper Boom errors so the service doesn't
    // return a generic "500 - Internal Server Error".
    const errHandler = (e: unknown) => {
        // invalid key id (`kid`). This should be treated as an authentication failure.
        if (e instanceof SigningKeyNotFoundError) {
            throw Boom.unauthorized();
        }

        // The key id isn't cached, and we've gone over the `jwksRequestPerMinute`. Tell clients to slow down.
        // This should be *highly* unlikely and is more of an indication of a malicious attack.
        if (e instanceof JwksRateLimitError) {
            throw Boom.tooManyRequests();
        }

        throw e;
    };

    // Actual key provider function to pass to `hapi-auth-jwt`
    return async (jwt: DecodedToken) => {
        // hapiJwt2KeyAsync throws an error if the alg isn't supported which errors the entire
        // auth pipeline. Need to check the alg and throw an unauthorized if it's not supported.
        if (jwt.header.alg !== "RS256") {
            throw Boom.unauthorized();
        }
        return jwksFn(jwt).catch(errHandler);
    };
};

/**
 * In order to allow multiple strategies to be chained, Hapi looks for `isMissing` on the boom error
 * which is only set if the message is not set. We need to unset the message in order to allow the strategies to chain.
 * @link https://github.com/dwyl/hapi-auth-jwt2/issues/217#issuecomment-268720478
 * @link https://github.com/dwyl/hapi-auth-jwt2/issues/217#issuecomment-404506826
 */
const errorFunc = (errorContext: hapiAuthJwt2.ErrorContext) => {
    if (errorContext.message === "Invalid token") {
        errorContext.message = undefined;
    }
    return errorContext;
};

export interface IHapiAuthPluginOpts {
    enabled: boolean;
    ignoreExpiration: boolean;
    secretKey: string;
    serviceName: string;
    strategies: string[];
    auth0: {
        audiences: string;
        issuer: string;
        jwksUri: string;
    };
}

export const authPlugin: Plugin<IHapiAuthPluginOpts> = {
    name: "auth",
    version: "0.0.0",
    register: async (server: Server, opts: IHapiAuthPluginOpts) => {
        // hapi-auth-jwt2's export types don't align cleanly with Hapi's TS defs;
        // coerce the type to satisfy the register signature.
        await server.register(hapiAuthJwt2 as unknown as Plugin<unknown>);

        const validate = (decoded: TokenPayload) => {
            // coerce the scope to be a string[].
            const scope = typeof decoded.scope === "string" ? decoded.scope.split(" ") : decoded.scope ?? [];
            // inject `_serviceName` in order for {@link Scope.M2M} to work
            const credentials = { ...decoded, scope, _serviceName: opts.serviceName };
            return { isValid: !!credentials, credentials };
        };

        if (opts.strategies.includes(AuthStrategy.AUTH0)) {
            const auth0Opts: hapiAuthJwt2.Options = {
                cookieKey: false,
                urlKey: false,
                headerKey: HEADER_KEY,
                tokenType: TOKEN_TYPE,
                complete: true,

                // dynamically provides signing key based on `kid` header
                key: getKeyProvider(opts.auth0.jwksUri),

                validate,
                errorFunc,
                verifyOptions: {
                    audience: opts.auth0.audiences,
                    issuer: opts.auth0.issuer,
                    algorithms: ["RS256"],
                },
            };

            server.auth.strategy(AuthStrategy.AUTH0, "jwt", auth0Opts);
        }

        if (opts.strategies.includes(AuthStrategy.JWT)) {
            const defaultOpts: hapiAuthJwt2.Options = {
                cookieKey: false,
                urlKey: false,
                headerKey: HEADER_KEY,
                tokenType: TOKEN_TYPE,
                key: opts.secretKey,
                responseFunc,
                validate,
                errorFunc,
                verifyOptions: {
                    algorithms: ["HS256"],
                    ignoreExpiration: opts.ignoreExpiration,
                },
            };

            // https://github.com/dwyl/hapi-auth-jwt2/issues/130
            // tl;dr - in order to bypass validation, customize 'verify' and unset 'validate'
            if (!opts.enabled) {
                Object(defaultOpts).verify = validate;
                delete Object(defaultOpts).validate;
            }

            server.auth.strategy(AuthStrategy.JWT, "jwt", defaultOpts);
        }
    },
};
