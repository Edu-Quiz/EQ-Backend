import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Professor = db.define('Professors',{
    first_name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [3, 100]
        }
    },
    last_name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    }
},{
    freezeTableName: true
});

export default Professor;