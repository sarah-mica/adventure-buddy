"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            uuid: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
                autoIncrement: false,
                defaultValue: Sequelize.UUIDV4,
            },
            email: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            location: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
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

        await queryInterface.addConstraint("user", {
            fields: ["uuid"],
            type: "unique",
            name: "user_uuid_uk",
        });

        await queryInterface.addConstraint("user", {
            fields: ["email"],
            type: "unique",
            name: "user_email_uk",
        });

        await queryInterface.addIndex("user", {
            fields: ["uuid"],
            name: "uuid_idx",
        });

        await queryInterface.addIndex("user", {
            fields: ["email"],
            name: "email_idx",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};