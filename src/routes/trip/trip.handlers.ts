import Boom from "@hapi/boom";
import { ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import {
    AddDayRequest,
    AddParticipantRequest,
    AddStopRequest,
    CreateTripRequest,
    GetTripByCodeRequest,
    RemoveDayRequest,
    RemoveParticipantRequest,
    RemoveStopRequest,
    TripResponse,
    UpdateDayRequest,
    UpdateStopRequest,
    UpdateTripRequest,
} from "./trip.responses.js";
import { TripManager } from "../../managers/trip/trip.manager.js";

const parseOptionalDate = (value: string | null | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatOptionalDate = (value: Date | string | null | undefined): string | null => {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    }

    return value.toISOString().slice(0, 10);
};

const formatDayResponse = (day: { id: number; title: string; date: string | null; notes: string | null; stops: Array<{ id: number; name: string; miles: number; elev: number }> }) => ({
    id: day.id,
    title: day.title,
    date: formatOptionalDate(day.date),
    notes: day.notes,
    stops: (day.stops ?? []).map((stop) => ({
        id: stop.id,
        name: stop.name,
        miles: stop.miles,
        elev: stop.elev,
    })),
});

const toParticipantResponse = (participant: { id: number; trip_id: number; name: string }) => ({
    id: participant.id,
    trip_id: participant.trip_id,
    name: participant.name,
});

const toDayResponse = (day: { id: number; trip_id: number; title: string; date: string | null; notes: string | null; position: number }) => ({
    id: day.id,
    trip_id: day.trip_id,
    title: day.title,
    date: formatOptionalDate(day.date),
    notes: day.notes,
    position: day.position,
});

const toStopResponse = (stop: { id: number; day_id: number; name: string; miles: number; elev: number; position: number }) => ({
    id: stop.id,
    day_id: stop.day_id,
    name: stop.name,
    miles: stop.miles,
    elev: stop.elev,
    position: stop.position,
});

const toTripResponse = (trip: { code: string; name: string; start_date: Date | string | null; end_date: Date | string | null; location: string | null; participants: Array<{ id: number; name: string }> ; days: Array<{ id: number; title: string; date: string | null; notes: string | null; stops: Array<{ id: number; name: string; miles: number; elev: number }> }> }): TripResponse => ({
    code: trip.code,
    name: trip.name,
    start_date: formatOptionalDate(trip.start_date),
    end_date: formatOptionalDate(trip.end_date),
    location: trip.location,
    participants: trip.participants ?? [],
    days: (trip.days ?? []).map((day) => formatDayResponse(day)),
});

export class TripHandlers {
    public static build(options: {
        tripManager: TripManager;
    }): TripHandlers {
        return new TripHandlers(options.tripManager);
    }

    private constructor(
        private readonly tripManager: TripManager,
    ) {
        this.createTrip = this.createTrip.bind(this);
        this.getTripByCode = this.getTripByCode.bind(this);
        this.updateTrip = this.updateTrip.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
        this.removeParticipant = this.removeParticipant.bind(this);
        this.addDay = this.addDay.bind(this);
        this.updateDay = this.updateDay.bind(this);
        this.removeDay = this.removeDay.bind(this);
        this.addStop = this.addStop.bind(this);
        this.updateStop = this.updateStop.bind(this);
        this.removeStop = this.removeStop.bind(this);
    }

    public async createTrip(request: CreateTripRequest, h: ResponseToolkit): Promise<TripResponse | ResponseObject> {
        const payload = request.payload ?? {};
        const { name, start_date, end_date, location } = payload;

        try {
            const trip = await this.tripManager.create(
                name,
                parseOptionalDate(start_date),
                parseOptionalDate(end_date),
                location,
            );

            return h
                .response(toTripResponse({
                    code: trip.code,
                    name: trip.name,
                    start_date: trip.start_date ?? null,
                    end_date: trip.end_date ?? null,
                    location: trip.location,
                    participants: [],
                    days: [],
                }))
                .code(StatusCodes.CREATED);
        } catch (error) {
            console.log("error", error);
            throw Boom.badRequest("Error creating trip");
        }
    }

    public async getTripByCode(request: GetTripByCodeRequest): Promise<TripResponse> {
        const { tripCode } = request.params;

        const trip = await this.tripManager.getByCode(tripCode);
        if (!trip) {
            throw Boom.notFound("Trip not found");
        }

        return toTripResponse(trip);
    }

    public async updateTrip(request: UpdateTripRequest, h: ResponseToolkit): Promise<TripResponse | ResponseObject> {
        const { tripCode } = request.params;
        const payload = request.payload ?? {};
        const { name, start_date, end_date, location } = payload;

        const updatedTrip = await this.tripManager.updateByCode(tripCode, {
            name,
            start_date: parseOptionalDate(start_date),
            end_date: parseOptionalDate(end_date),
            location: location ?? null,
        });

        if (!updatedTrip) {
            throw Boom.notFound("Trip not found");
        }

        return h.response(toTripResponse(updatedTrip)).code(StatusCodes.OK);
    }

    public async addParticipant(request: AddParticipantRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode } = request.params;
        const { name } = request.payload;

        const participant = await this.tripManager.addParticipant(tripCode, name);
        if (!participant) {
            throw Boom.notFound("Trip not found");
        }

        return h.response(toParticipantResponse(participant)).code(StatusCodes.CREATED);
    }

    public async removeParticipant(request: RemoveParticipantRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, participantId } = request.params;
        const removed = await this.tripManager.removeParticipant(tripCode, Number(participantId));
        if (!removed) {
            throw Boom.notFound("Participant not found");
        }

        return h.response().code(StatusCodes.NO_CONTENT);
    }

    public async addDay(request: AddDayRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode } = request.params;
        const { title, date, notes, position } = request.payload;

        console.log("addDay request", { tripCode, title, date, notes, position });
        const day = await this.tripManager.addDay(tripCode, { title, date, notes, position });
        if (!day) {
            throw Boom.notFound("Trip not found");
        }

        return h.response(toDayResponse(day)).code(StatusCodes.CREATED);
    }

    public async updateDay(request: UpdateDayRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, dayId } = request.params;
        const { title, date, notes, position } = request.payload;

        const updated = await this.tripManager.updateDay(tripCode, Number(dayId), { title, date, notes, position });
        if (!updated) {
            throw Boom.notFound("Day not found");
        }

        return h.response().code(StatusCodes.NO_CONTENT);
    }

    public async removeDay(request: RemoveDayRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, dayId } = request.params;
        const removed = await this.tripManager.removeDay(tripCode, Number(dayId));
        if (!removed) {
            throw Boom.notFound("Day not found");
        }

        return h.response().code(StatusCodes.NO_CONTENT);
    }

    public async addStop(request: AddStopRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, dayId } = request.params;
        const { name, miles, elev, position } = request.payload;

        const stop = await this.tripManager.addStop(tripCode, Number(dayId), { name, miles, elev, position });
        if (!stop) {
            throw Boom.notFound("Stop not found");
        }

        return h.response(toStopResponse(stop)).code(StatusCodes.CREATED);
    }

    public async updateStop(request: UpdateStopRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, stopId } = request.params;
        const { name, miles, elev, position } = request.payload;

        const updated = await this.tripManager.updateStop(tripCode, Number(stopId), { name, miles, elev, position });
        if (!updated) {
            throw Boom.notFound("Stop not found");
        }

        return h.response().code(StatusCodes.NO_CONTENT);
    }

    public async removeStop(request: RemoveStopRequest, h: ResponseToolkit): Promise<ResponseObject> {
        const { tripCode, stopId } = request.params;
        const removed = await this.tripManager.removeStop(tripCode, Number(stopId));
        if (!removed) {
            throw Boom.notFound("Stop not found");
        }

        return h.response().code(StatusCodes.NO_CONTENT);
    }
}
