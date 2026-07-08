import { ServerRoute } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import {
    createUserPayloadSchema,
    getUserByUuidParamsSchema,
    loginRequestSchema,
    userResponseSchema,
} from "./user.responses.js";
import { UserHandlers } from "./user.handlers.js";

export const userRoutes = (userHandlers: UserHandlers): ServerRoute[] => [
    {
        method: "POST",
        path: "/user",
        handler: userHandlers.createUser as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                payload: createUserPayloadSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: userResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "GET",
        path: "/user/{userUuid}",
        handler: userHandlers.getUserByUuid as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getUserByUuidParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.OK]: userResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "POST",
        path: "/login",
        handler: userHandlers.login as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                payload: loginRequestSchema,
            },
            response: {
                status: {
                    [StatusCodes.OK]: userResponseSchema,
                },
            },
            cors: true,
        },
    },
];
