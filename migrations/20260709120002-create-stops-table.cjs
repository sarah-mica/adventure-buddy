"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("stops", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            day_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "days",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                defaultValue: "",
            },
            miles: {
                type: Sequelize.DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            elev: {
                type: Sequelize.DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
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

        await queryInterface.addIndex("stops", {
            fields: ["day_id"],
            name: "stops_day_id_idx",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("stops");
    },
};
