import { Transaction } from "sequelize";
import { DayModel } from "../../models/day.js";
import { ParticipantModel } from "../../models/participant.js";
import { StopModel } from "../../models/stop.js";
import { Trip, TripCreation, TripModel, TripUpdate } from "../../models/trip.js";
import { TransactionOptions } from "../../util/db.js";

export type ExpandedTrip = {
    id: number;
    code: string;
    name: string;
    location: string | null;
    start_date: Date | null;
    end_date: Date | null;
    participants: Array<{ id: number; trip_id: number; name: string }>;
    days: Array<{
        id: number;
        trip_id: number;
        title: string;
        date: string | null;
        notes: string | null;
        position: number;
        stops: Array<{ id: number; day_id: number; name: string; miles: number; elev: number; position: number }>;
    }>;
};

export class TripRepo {
    public static build(): TripRepo {
        return new TripRepo();
    }

    public async create(creationAttributes: TripCreation, transaction?: Transaction): Promise<Trip> {
        const trip = await TripModel.create(creationAttributes, { transaction });

        return trip.get();
    }

    public async getById(id: number, { transaction, lock }: TransactionOptions = {}): Promise<Trip | null> {
        const trip = await TripModel.findByPk(id, { transaction, lock });

        return trip?.get() ?? null;
    }

    public async getByCode(code: string, { transaction, lock }: TransactionOptions = {}): Promise<ExpandedTrip | null> {
        const trip = await TripModel.findOne({
            where: { code },
            transaction,
            lock,
        });

        if (!trip) {
            return null;
        }

        const participants = await ParticipantModel.findAll({
            where: { trip_id: trip.id },
            order: [["id", "ASC"]],
            transaction,
        });

        const days = await DayModel.findAll({
            where: { trip_id: trip.id },
            order: [["position", "ASC"], ["id", "ASC"]],
            transaction,
        });

        const dayIds = days.map((day) => day.id);
        const stops = dayIds.length > 0
            ? await StopModel.findAll({
                where: { day_id: dayIds },
                order: [["position", "ASC"], ["id", "ASC"]],
                transaction,
            })
            : [];

        return {
            ...trip.get(),
            participants: participants.map((participant) => participant.get()),
            days: days.map((day) => ({
                ...day.get(),
                stops: stops
                    .filter((stop) => stop.day_id === day.id)
                    .map((stop) => stop.get()),
            })),
        };
    }

    public async updateById(id: number, attributes: TripUpdate, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await TripModel.update(attributes, {
            where: { id },
            transaction,
        });

        return affectedCount;
    }

    public async updateByCode(code: string, attributes: TripUpdate, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await TripModel.update(attributes, {
            where: { code },
            transaction,
        });

        return affectedCount;
    }

    public async createParticipant(tripId: number, name: string, transaction?: Transaction): Promise<{ id: number; trip_id: number; name: string }> {
        const participant = await ParticipantModel.create({ trip_id: tripId, name }, { transaction });

        return participant.get();
    }

    public async removeParticipant(tripId: number, participantId: number, transaction?: Transaction): Promise<number> {
        return await ParticipantModel.destroy({
            where: { id: participantId, trip_id: tripId },
            transaction,
        });
    }

    public async createDay(tripId: number, attributes: { title?: string; date?: string | null; notes?: string | null; position?: number }, transaction?: Transaction): Promise<{ id: number; trip_id: number; title: string; date: string | null; notes: string | null; position: number }> {
        const day = await DayModel.create({
            trip_id: tripId,
            title: attributes.title ?? "",
            date: attributes.date ?? null,
            notes: attributes.notes ?? null,
            position: attributes.position ?? 0,
        }, { transaction });

        return day.get();
    }

    public async updateDay(tripId: number, dayId: number, attributes: { title?: string; date?: string | null; notes?: string | null; position?: number }, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await DayModel.update(attributes, {
            where: { id: dayId, trip_id: tripId },
            transaction,
        });

        return affectedCount;
    }

    public async removeDay(tripId: number, dayId: number, transaction?: Transaction): Promise<number> {
        return await DayModel.destroy({
            where: { id: dayId, trip_id: tripId },
            transaction,
        });
    }

    public async createStop(dayId: number, attributes: { name?: string; miles?: number; elev?: number; position?: number }, transaction?: Transaction): Promise<{ id: number; day_id: number; name: string; miles: number; elev: number; position: number }> {
        const stop = await StopModel.create({
            day_id: dayId,
            name: attributes.name ?? "",
            miles: attributes.miles ?? 0,
            elev: attributes.elev ?? 0,
            position: attributes.position ?? 0,
        }, { transaction });

        return stop.get();
    }

    public async updateStop(dayId: number, stopId: number, attributes: { name?: string; miles?: number; elev?: number; position?: number }, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await StopModel.update(attributes, {
            where: { id: stopId, day_id: dayId },
            transaction,
        });

        return affectedCount;
    }

    public async removeStop(dayId: number, stopId: number, transaction?: Transaction): Promise<number> {
        return await StopModel.destroy({
            where: { id: stopId, day_id: dayId },
            transaction,
        });
    }
}
