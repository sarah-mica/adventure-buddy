import { ServerRoute } from "@hapi/hapi";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import {
    addParticipantPayloadSchema,
    createTripPayloadSchema,
    dayParamsSchema,
    getTripByCodeParamsSchema,
    participantParamsSchema,
    participantResponseSchema,
    stopParamsSchema,
    stopResponseSchema,
    tripResponseSchema,
    updateTripPayloadSchema,
    dayResponseSchema,
} from "./trip.responses.js";
import { TripHandlers } from "./trip.handlers.js";

export const tripRoutes = (tripHandlers: TripHandlers): ServerRoute[] => [
    {
        method: "POST",
        path: "/trip",
        handler: tripHandlers.createTrip as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                payload: createTripPayloadSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: tripResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "GET",
        path: "/trip/{tripCode}",
        handler: tripHandlers.getTripByCode as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getTripByCodeParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.OK]: tripResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "PUT",
        path: "/trip/{tripCode}",
        handler: tripHandlers.updateTrip as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getTripByCodeParamsSchema,
                payload: updateTripPayloadSchema,
            },
            response: {
                status: {
                    [StatusCodes.OK]: tripResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "POST",
        path: "/trip/{tripCode}/participants",
        handler: tripHandlers.addParticipant as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getTripByCodeParamsSchema,
                payload: addParticipantPayloadSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: participantResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "DELETE",
        path: "/trip/{tripCode}/participants/{participantId}",
        handler: tripHandlers.removeParticipant as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: participantParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.NO_CONTENT]: Joi.any(),
                },
            },
            cors: true,
        },
    },
    {
        method: "POST",
        path: "/trip/{tripCode}/days",
        handler: tripHandlers.addDay as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getTripByCodeParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: dayResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "POST",
        path: "/trips/{tripCode}/days",
        handler: tripHandlers.addDay as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: getTripByCodeParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: dayResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "PUT",
        path: "/trip/{tripCode}/days/{dayId}",
        handler: tripHandlers.updateDay as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: dayParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.NO_CONTENT]: Joi.any(),
                },
            },
            cors: true,
        },
    },
    {
        method: "DELETE",
        path: "/trip/{tripCode}/days/{dayId}",
        handler: tripHandlers.removeDay as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: dayParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.NO_CONTENT]: Joi.any(),
                },
            },
            cors: true,
        },
    },
    {
        method: "POST",
        path: "/trip/{tripCode}/days/{dayId}/stops",
        handler: tripHandlers.addStop as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: dayParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.CREATED]: stopResponseSchema,
                },
            },
            cors: true,
        },
    },
    {
        method: "PUT",
        path: "/trip/{tripCode}/stops/{stopId}",
        handler: tripHandlers.updateStop as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: stopParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.NO_CONTENT]: Joi.any(),
                },
            },
            cors: true,
        },
    },
    {
        method: "DELETE",
        path: "/trip/{tripCode}/stops/{stopId}",
        handler: tripHandlers.removeStop as ServerRoute["handler"],
        options: {
            tags: ["api"],
            validate: {
                params: stopParamsSchema,
            },
            response: {
                status: {
                    [StatusCodes.NO_CONTENT]: Joi.any(),
                },
            },
            cors: true,
        },
    },
];
