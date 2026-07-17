import { Transaction } from "sequelize";
import { TransactionOptions } from "../../util/db.js";
import { Trip } from "../../models/trip.js";
import { ExpandedTrip, TripRepo } from "./trip.repo.js";

const WORDS = ["PINE","RIDGE","CREEK","SUMMIT","BASIN","CAIRN","GRANITE","TIMBER","ALPINE","MOSS"];
function genCode() {
  const w = WORDS[Math.floor(Math.random() * WORDS.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${w}-${n}`;
}


export class TripManager {
    public static build({ tripRepo }: { tripRepo: TripRepo }): TripManager {
        return new TripManager(tripRepo);
    }

    private constructor(private readonly tripRepo: TripRepo) {}

    private async generateUniqueCode(): Promise<string> {
        for (let attempt = 0; attempt < 50; attempt += 1) {
            const code = genCode();
            const existingTrip = await this.tripRepo.getByCode(code);

            if (!existingTrip) {
                return code;
            } else {
                console.log(`Collision detected for trip code: ${code}. Retrying...`);
            }
        }

        throw new Error("Unable to generate a unique trip code");
    }

    public async create(
        name?: string,
        start_date?: Date | null,
        end_date?: Date | null,
        location?: string | null,
        transaction?: Transaction,
    ): Promise<Trip> {

        const code = await this.generateUniqueCode();

        const creationAttributes = {
            code,
            name,
            start_date,
            end_date,
            location,
        };

        return await this.tripRepo.create(creationAttributes, transaction);
    }

    public async getById(id: number, { transaction, lock }: TransactionOptions = {}): Promise<Trip | null> {
        return await this.tripRepo.getById(id, { transaction, lock });
    }

    public async getByCode(code: string, { transaction, lock }: TransactionOptions = {}): Promise<ExpandedTrip | null> {
        return await this.tripRepo.getByCode(code, { transaction, lock });
    }

    public async updateByCode(code: string, attributes: { name?: string; location?: string | null; start_date?: Date | null; end_date?: Date | null }, transaction?: Transaction): Promise<ExpandedTrip | null> {
        const affectedCount = await this.tripRepo.updateByCode(code, attributes, transaction);
        if (affectedCount === 0) {
            return null;
        }

        console.log(`Trip with code ${code} updated successfully. Affected rows: ${affectedCount}`);

        return await this.tripRepo.getByCode(code, { transaction });
    }

    public async addParticipant(code: string, name: string): Promise<{ id: number; trip_id: number; name: string } | null> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return null;
        }

        return await this.tripRepo.createParticipant(trip.id, name);
    }

    public async removeParticipant(code: string, participantId: number): Promise<boolean> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return false;
        }

        const removed = await this.tripRepo.removeParticipant(trip.id, participantId);
        return removed > 0;
    }

    public async addDay(code: string, attributes: { title?: string; date?: string | null; notes?: string | null; position?: number }): Promise<{ id: number; trip_id: number; title: string; date: string | null; notes: string | null; position: number } | null> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return null;
        }

        return await this.tripRepo.createDay(trip.id, attributes);
    }

    public async updateDay(code: string, dayId: number, attributes: { title?: string; date?: string | null; notes?: string | null; position?: number }): Promise<boolean> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return false;
        }

        const updated = await this.tripRepo.updateDay(trip.id, dayId, attributes);
        return updated > 0;
    }

    public async removeDay(code: string, dayId: number): Promise<boolean> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return false;
        }

        const removed = await this.tripRepo.removeDay(trip.id, dayId);
        return removed > 0;
    }

    public async addStop(code: string, dayId: number, attributes: { name?: string; miles?: number; elev?: number; position?: number }): Promise<{ id: number; day_id: number; name: string; miles: number; elev: number; position: number } | null> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return null;
        }

        const dayBelongsToTrip = trip.days.some((day) => day.id === dayId);
        if (!dayBelongsToTrip) {
            return null;
        }

        return await this.tripRepo.createStop(dayId, attributes);
    }

    public async updateStop(code: string, stopId: number, attributes: { name?: string; miles?: number; elev?: number; position?: number }): Promise<boolean> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return false;
        }

        const stopExists = trip.days.some((day) => day.stops.some((stop) => stop.id === stopId));
        if (!stopExists) {
            return false;
        }

        const dayId = trip.days.find((day) => day.stops.some((stop) => stop.id === stopId))?.id;
        if (!dayId) {
            return false;
        }

        const updated = await this.tripRepo.updateStop(dayId, stopId, attributes);
        return updated > 0;
    }

    public async removeStop(code: string, stopId: number): Promise<boolean> {
        const trip = await this.tripRepo.getByCode(code);
        if (!trip) {
            return false;
        }

        const stopExists = trip.days.some((day) => day.stops.some((stop) => stop.id === stopId));
        if (!stopExists) {
            return false;
        }

        const dayId = trip.days.find((day) => day.stops.some((stop) => stop.id === stopId))?.id;
        if (!dayId) {
            return false;
        }

        const removed = await this.tripRepo.removeStop(dayId, stopId);
        return removed > 0;
    }
}