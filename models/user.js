const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        role: {
            type: DataTypes.ENUM("admin", "viewer"),
            allowNull: false,
            defaultValue: "viewer"
        },

        // Optional — collected at registration, used to identify the
        // account for account-recovery. Nullable so existing seeded
        // accounts (which predate this column) are unaffected.
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },

        // Forgot-password OTP state. Both are cleared once the code is
        // used (or a new one is requested).
        resetOtpHash: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "reset_otp_hash"
        },

        resetOtpExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "reset_otp_expires_at"
        }
    },
    {
        tableName: "users",
        timestamps: false   
    }
);

module.exports = User;