import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Attributes, CreationAttributes } from "sequelize/types/model";
import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Default,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt,
} from "sequelize-typescript";

export const UserModelName = "user";

export type User = Attributes<UserModel>;
export type UserCreation = Omit<CreationAttributes<UserModel>, "createdAt" | "updatedAt">;

export type UserUpdate = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

@Table({
    modelName: UserModelName,
    tableName: UserModelName,
    timestamps: true,
    paranoid: false,
})
export class UserModel extends Model<
    InferAttributes<UserModel, { omit: "version" | "deletedAt" }>,
    InferCreationAttributes<UserModel, { omit: "version" | "deletedAt" }>
> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Unique
    @Column(DataType.UUID)
    declare uuid: CreationOptional<string>;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    declare email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare password: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare location: string;

    @CreatedAt
    declare createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare updatedAt: CreationOptional<Date>;
}
