import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { UserModel } from "./user.js";
import { Dialect } from "sequelize";

export interface IDBConfig extends SequelizeOptions {
    dialect: Dialect;
    logging: boolean;
    supportsUpdateOnDuplicates: boolean;
    paranoid: boolean;
}

export const initModels = async (opts: IDBConfig): Promise<Sequelize> => {
    const newOpts = { ...opts, storage: "database.sqlite" };

    const sequelizeInstance = new Sequelize(newOpts);

    sequelizeInstance.addModels([UserModel]);

    if (opts.dialect === "sqlite") {
        await sequelizeInstance.sync();
    }

    return sequelizeInstance;
};
