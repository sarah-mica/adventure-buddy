import { Transaction } from "sequelize";
import { User, UserCreation, UserModel, UserUpdate } from "../../models/user.js";
import { TransactionOptions } from "../../util/db.js";

export class UserRepo {
    public static build(): UserRepo {
        return new UserRepo();
    }

    public async create(creationAttributes: UserCreation, transaction?: Transaction): Promise<User> {
        const user = await UserModel.create(creationAttributes, { transaction });

        return user.get();
    }

    /**
     * Should only be used internally for the service, never directly accessed via API calls
     */
    public async getById(id: number, { transaction, lock }: TransactionOptions = {}): Promise<User | null> {
        const user = await UserModel.findByPk(id, { transaction, lock });

        return user?.get() ?? null;
    }

    public async getByUuid(uuid: string, { transaction, lock }: TransactionOptions = {}): Promise<User | null> {
        const user = await UserModel.findOne({
            where: { uuid },
            transaction,
            lock,
        });

        return user?.get() ?? null;
    }

    public async getByEmail(email: string, { transaction, lock }: TransactionOptions = {}): Promise<User | null> {
        const user = await UserModel.findOne({
            where: { email },
            transaction,
            lock,
        });

        return user?.get() ?? null;
    }

    /**
     * Should only be used internally for the service, never directly accessed via API calls
     */
    public async updateById(id: number, attributes: UserUpdate, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await UserModel.update(attributes, {
            where: { id },
            transaction,
        });

        return affectedCount;
    }

    public async updateByUuid(uuid: string, attributes: UserUpdate, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await UserModel.update(attributes, {
            where: { uuid },
            transaction,
        });

        return affectedCount;
    }
}
