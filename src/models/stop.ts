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
    UpdatedAt,
} from "sequelize-typescript";

export const StopModelName = "stop";

export type Stop = Attributes<StopModel>;
export type StopCreation = Omit<CreationAttributes<StopModel>, "createdAt" | "updatedAt">;
export type StopUpdate = Partial<Omit<Stop, "id" | "createdAt" | "updatedAt">>;

@Table({
    modelName: StopModelName,
    tableName: "stops",
    timestamps: true,
    paranoid: false,
})
export class StopModel extends Model<
    InferAttributes<StopModel, { omit: "version" | "deletedAt" }>,
    InferCreationAttributes<StopModel, { omit: "version" | "deletedAt" }>
> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare day_id: number;

    @AllowNull(false)
    @Default("")
    @Column(DataType.STRING)
    declare name: string;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.FLOAT)
    declare miles: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.FLOAT)
    declare elev: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare position: number;

    @CreatedAt
    declare createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare updatedAt: CreationOptional<Date>;
}
