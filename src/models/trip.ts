import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Attributes, CreationAttributes } from "sequelize/types/model";
import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Default,
    HasMany,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt,
} from "sequelize-typescript";
import { DayModel } from "./day.js";
import { ParticipantModel } from "./participant.js";

export const TripModelName = "trip";

export type Trip = Attributes<TripModel>;
export type TripCreation = Omit<CreationAttributes<TripModel>, "createdAt" | "updatedAt">;
export type TripUpdate = Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>;

@Table({
    modelName: TripModelName,
    tableName: "trips",
    timestamps: true,
    paranoid: false,
})
export class TripModel extends Model<
    InferAttributes<TripModel, { omit: "version" | "deletedAt" }>,
    InferCreationAttributes<TripModel, { omit: "version" | "deletedAt" }>
> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    declare code: string;

    @AllowNull(false)
    @Default("Untitled Trek")
    @Column(DataType.STRING)
    declare name: CreationOptional<string>;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare location: string | null;

    @AllowNull(true)
    @Column({ type: DataType.DATE, field: "start_date" })
    declare start_date: Date | null;

    @AllowNull(true)
    @Column({ type: DataType.DATE, field: "end_date" })
    declare end_date: Date | null;

    @CreatedAt
    declare createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare updatedAt: CreationOptional<Date>;

    @HasMany(() => ParticipantModel, { foreignKey: "trip_id", as: "participants" })
    declare participants?: ParticipantModel[];

    @HasMany(() => DayModel, { foreignKey: "trip_id", as: "days" })
    declare days?: DayModel[];
}
