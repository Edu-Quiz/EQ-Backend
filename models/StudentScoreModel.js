import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const StudentScore = db.define('StudentScore',{
    score:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
},{
    freezeTableName: true
});

export default StudentScore;