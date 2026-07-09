import { Request } from "@hapi/hapi";
import Joi from "joi";

export type TripPayload = {
    name?: string;
    start_date?: string | null;
    end_date?: string | null;
    location?: string | null;
};

export type CreateTripRequest = Request<{
    Payload: TripPayload;
}>;

export type TripResponse = {
    code: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    participants: Array<{ id: number; name: string }>;
    days: Array<{
        id: number;
        title: string;
        date: string | null;
        notes: string | null;
        stops: Array<{ id: number; name: string; miles: number; elev: number }>;
    }>;
};

export type GetTripByCodeRequest = Request<{
    Params: {
        tripCode: string;
    };
}>;

export type UpdateTripRequest = Request<{
    Params: {
        tripCode: string;
    };
    Payload: TripPayload;
}>;

export type AddParticipantRequest = Request<{
    Params: {
        tripCode: string;
    };
    Payload: {
        name: string;
    };
}>;

export type RemoveParticipantRequest = Request<{
    Params: {
        tripCode: string;
        participantId: string;
    };
}>;

export type AddDayRequest = Request<{
    Params: {
        tripCode: string;
    };
    Payload: {
        title?: string;
        date?: string | null;
        notes?: string | null;
        position?: number;
    };
}>;

export type UpdateDayRequest = Request<{
    Params: {
        tripCode: string;
        dayId: string;
    };
    Payload: {
        title?: string;
        date?: string | null;
        notes?: string | null;
        position?: number;
    };
}>;

export type RemoveDayRequest = Request<{
    Params: {
        tripCode: string;
        dayId: string;
    };
}>;

export type AddStopRequest = Request<{
    Params: {
        tripCode: string;
        dayId: string;
    };
    Payload: {
        name?: string;
        miles?: number;
        elev?: number;
        position?: number;
    };
}>;

export type UpdateStopRequest = Request<{
    Params: {
        tripCode: string;
        stopId: string;
    };
    Payload: {
        name?: string;
        miles?: number;
        elev?: number;
        position?: number;
    };
}>;

export type RemoveStopRequest = Request<{
    Params: {
        tripCode: string;
        stopId: string;
    };
}>;

export const createTripPayloadSchema = Joi.object<TripPayload>({
    name: Joi.string().optional().description("Trip name"),
    start_date: Joi.string().allow(null).optional().description("Trip start date"),
    end_date: Joi.string().allow(null).optional().description("Trip end date"),
    location: Joi.string().allow(null).optional().description("Trip location"),
}).optional().allow(null).label("CreateTripPayload");

export const updateTripPayloadSchema = Joi.object<TripPayload>({
    name: Joi.string().optional().description("Trip name"),
    start_date: Joi.string().allow(null).optional().description("Trip start date"),
    end_date: Joi.string().allow(null).optional().description("Trip end date"),
    location: Joi.string().allow(null).optional().description("Trip location"),
}).optional().allow(null).label("UpdateTripPayload");

export const addParticipantPayloadSchema = Joi.object<AddParticipantRequest["payload"]>({
    name: Joi.string().required().description("Participant name"),
}).label("AddParticipantPayload");

export const getTripByCodeParamsSchema = Joi.object<GetTripByCodeRequest["params"]>({
    tripCode: Joi.string().required().description("Trip code"),
}).label("GetTripByCodeParams");

export const participantParamsSchema = Joi.object<RemoveParticipantRequest["params"]>({
    tripCode: Joi.string().required().description("Trip code"),
    participantId: Joi.string().required().description("Participant id"),
}).label("ParticipantParams");

export const dayParamsSchema = Joi.object<RemoveDayRequest["params"]>({
    tripCode: Joi.string().required().description("Trip code"),
    dayId: Joi.string().required().description("Day id"),
}).label("DayParams");

export const stopParamsSchema = Joi.object<RemoveStopRequest["params"]>({
    tripCode: Joi.string().required().description("Trip code"),
    stopId: Joi.string().required().description("Stop id"),
}).label("StopParams");

export const participantResponseSchema = Joi.object({
    id: Joi.number().required(),
    trip_id: Joi.number().required(),
    name: Joi.string().required(),
}).label("ParticipantResponse");

export const dayResponseSchema = Joi.object({
    id: Joi.number().required(),
    trip_id: Joi.number().required(),
    title: Joi.string().required(),
    date: Joi.string().allow(null),
    notes: Joi.string().allow(null),
    position: Joi.number().required(),
}).label("DayResponse");

export const stopResponseSchema = Joi.object({
    id: Joi.number().required(),
    day_id: Joi.number().required(),
    name: Joi.string().required(),
    miles: Joi.number().required(),
    elev: Joi.number().required(),
    position: Joi.number().required(),
}).label("StopResponse");

export const tripResponseSchema = Joi.object<TripResponse>({
    code: Joi.string().description("Trip code"),
    name: Joi.string().description("Trip name"),
    start_date: Joi.string().allow(null).description("Trip start date"),
    end_date: Joi.string().allow(null).description("Trip end date"),
    location: Joi.string().allow(null).description("Trip location"),
    participants: Joi.array().items(Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
    })).default([]),
    days: Joi.array().items(Joi.object({
        id: Joi.number().required(),
        title: Joi.string().required(),
        date: Joi.string().allow(null),
        notes: Joi.string().allow(null),
        stops: Joi.array().items(Joi.object({
            id: Joi.number().required(),
            name: Joi.string().required(),
            miles: Joi.number().required(),
            elev: Joi.number().required(),
        })).default([]),
    })).default([]),
}).label("TripResponse");

