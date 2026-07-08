/* eslint-disable @typescript-eslint/no-require-imports */
import * as Hapi from "@hapi/hapi";
import inert from "@hapi/inert";
import vision from "@hapi/vision";
import swagger from "hapi-swagger";
import lodash from "lodash";
import { RegisterOptions } from "hapi-swagger";
import { jsonapiErrorPlugin } from "../plugins/hapi-errors.js";

/**
 * registers the routes with the `serviceName` and `version` prefix into the hapi server.
 *
 * example:
 * if the serviceName = "foobar" and version = "v4", then all routes will be prefixed
 * with "/foobar/v4/..."
 *
 * @param {hapi.ServerRoute[]} routes - routes to register
 * @param {string=} version - route version, must match "^v[0-9]+$"
 * @return {HSServiceApp}
 */
export const registerServiceRoutes = (server: Hapi.Server, routes: Hapi.ServerRoute[], version?: string): void => {
    console.log(`[hapi-routes] registering ${routes.length} routes`);
    if (!lodash.isNil(version)) {
        const versionRegex = RegExp("^v[0-9]+$");
        if (!versionRegex.test(version)) {
            throw new Error(`version ${version} must match ${versionRegex.source}`);
        }
    }

    const prefix = ["entling", version].filter((str) => !lodash.isEmpty(str)).join("/");

    routes.forEach((route) => {
        // inject version number into the tags for swagger grouping
        const tags: string[] = lodash.get(route, "options.tags", []);
        if (tags.includes("api") && !lodash.isNil(version)) {
            tags.push(version);
        }

        // prepend `prefix` onto the route path
        route.path = ["/", prefix, route.path].join("");

        // register route into hapi
        server.route(route);
        console.log(`[hapi-routes] registered: ${route.method} ${route.path}`, { tags });
    });
};

export async function registerHapiPlugins(server: Hapi.Server): Promise<void> {
    // hapi-swagger plugin
    await server.register([
        {
            plugin: inert,
        },
        {
            plugin: vision,
        },
        {
            plugin: swagger,
            options: {
                grouping: "tags",
                //schemes: config.env === Environment.DEVELOPMENT ? ["http"] : ["https"],
                basePath: "/entling",
                //documentationPath: `/${config.serviceName}/documentation`,
                //jsonPath: `/${config.serviceName}/swagger.json`,
                pathPrefixSize: 2,
                //swaggerUIPath: `/${config.serviceName}/swaggerui/`,
                info: {
                    title: `Entling Service API Documentation`,
                },
                securityDefinitions: {
                    jwt: {
                        type: "apiKey",
                        name: "Authorization",
                        in: "header",
                        description: "Description: adds authorization header to request, use the form: `bearer <jwt>`",
                    },
                },
                security: [{ jwt: [] }],
            } as RegisterOptions,
        },
    ]);
    console.debug("[hapi-plugins] registered hapi-swagger plugin");

    // auth plugin
    // TODO: add auth plugin later
    // await server.register({
    //     plugin: authPlugin,
    //     options: {
    //         enabled: config.auth.enabled,
    //         ignoreExpiration: config.auth.ignoreExpiration,
    //         secretKey: config.auth.secretKey,
    //         serviceName: config.serviceName,
    //         strategies: config.auth.strategies,
    //         auth0: {
    //             audiences: [config.auth.auth0.audience.ginger, config.auth.auth0.audience.headspace],
    //             issuer: config.auth.auth0.issuer,
    //             jwksUri: config.auth.auth0.jwksUri,
    //         },
    //     },
    // });
    //console.log("[hapi-plugins] registered auth plugin");

    // config plugin
    // await server.register({
    //     plugin: configHapiPlugin,
    //     options: { config, rawConfig },
    // });
    // console.log("[hapi-plugins] registered config plugin");

    // jsonapi-error plugin
    await server.register({
        plugin: jsonapiErrorPlugin,
    });
    console.log("[hapi-plugins] registered jsonapi-error plugin");

    // healthcheck plugin
    // await server.register({
    //     plugin: healthcheckPlugin,
    //     options: { serviceName: config.serviceName, shutdownCoordinator },
    // });
    // console.log("[hapi-plugins] registered healthcheck plugin");
}