import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Attributes, CreationAttributes } from "sequelize/types/model";
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import { TripModel } from "./trip.js";

export const DayModelName = "day";

export type Day = Attributes<DayModel>;
export type DayCreation = Omit<CreationAttributes<DayModel>, "createdAt" | "updatedAt">;
export type DayUpdate = Partial<Omit<Day, "id" | "createdAt" | "updatedAt">>;

@Table({
    modelName: DayModelName,
    tableName: "days",
    timestamps: true,
    paranoid: false,
})
export class DayModel extends Model<
    InferAttributes<DayModel, { omit: "version" | "deletedAt" }>,
    InferCreationAttributes<DayModel, { omit: "version" | "deletedAt" }>
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
    @Default("")
    @Column(DataType.STRING)
    declare title: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare date: string | null;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare notes: string | null;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare position: number;

    @CreatedAt
    declare createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => TripModel, { foreignKey: "trip_id", as: "trip" })
    declare trip?: TripModel;
}
