import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { UserModel } from "./user.js";
import { Dialect } from "sequelize";
import { DayModel } from "./day.js";
import { ParticipantModel } from "./participant.js";
import { StopModel } from "./stop.js";
import { TripModel } from "./trip.js";

export interface IDBConfig extends SequelizeOptions {
    dialect: Dialect;
    logging: boolean;
    supportsUpdateOnDuplicates: boolean;
    paranoid: boolean;
}

export const initModels = async (opts: IDBConfig): Promise<Sequelize> => {
    const newOpts = { ...opts, storage: "database.sqlite" };

    const sequelizeInstance = new Sequelize(newOpts);

    sequelizeInstance.addModels([UserModel, TripModel, ParticipantModel, DayModel, StopModel]);

    if (opts.dialect === "sqlite") {
        await sequelizeInstance.sync();
    }

    return sequelizeInstance;
};
