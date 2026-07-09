"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("days", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            trip_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "trips",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            title: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                defaultValue: "",
            },
            date: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            notes: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            position: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            createdAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex("days", {
            fields: ["trip_id"],
            name: "days_trip_id_idx",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("days");
    },
};
