import { ServerRoute } from "@hapi/hapi";
import {
    addParticipantPayloadSchema,
    createTripPayloadSchema,
    dayParamsSchema,
    getTripByCodeParamsSchema,
    participantParamsSchema,
    stopParamsSchema,
    updateTripPayloadSchema,
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
            cors: true,
        },
    },
];
