import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Attributes, CreationAttributes } from "sequelize/types/model";
import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import { TripModel } from "./trip.js";

export const ParticipantModelName = "participant";

export type Participant = Attributes<ParticipantModel>;
export type ParticipantCreation = Omit<CreationAttributes<ParticipantModel>, "createdAt" | "updatedAt">;
export type ParticipantUpdate = Partial<Omit<Participant, "id" | "createdAt" | "updatedAt">>;

@Table({
    modelName: ParticipantModelName,
    tableName: "participants",
    timestamps: true,
    paranoid: false,
})
export class ParticipantModel extends Model<
    InferAttributes<ParticipantModel, { omit: "version" | "deletedAt" }>,
    InferCreationAttributes<ParticipantModel, { omit: "version" | "deletedAt" }>
> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @ForeignKey(() => TripModel)
    @Column(DataType.INTEGER)
    declare trip_id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare name: string;

    @CreatedAt
    declare createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare updatedAt: CreationOptional<Date>;
}
