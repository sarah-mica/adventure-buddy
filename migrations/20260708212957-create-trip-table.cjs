'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable("trips", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                defaultValue: "Untitled Trek"
            },
            location: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            start_date: {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
            },
            end_date: {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
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

        await queryInterface.addConstraint("trips", {
            fields: ["code"],
            type: "unique",
            name: "trips_code_uk",
        });

        await queryInterface.addIndex("trips", {
            fields: ["code"],
            name: "code_idx",
        });
  },

    async down (queryInterface, Sequelize) {
        await queryInterface.dropTable("trips");
    }
};
