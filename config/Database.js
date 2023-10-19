import {Sequelize} from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// const db = new Sequelize(process.env.POSTGRES_DB_URL, {
//     dialect: "postgres",
//     protocol: "postgres",
//     dialectOptions: {
//         ssl: JSON.parse(process.env.DB_SSL),
//         native: true
//     },
// });

const db = new Sequelize("auth_db","root","", {
    dialect: "mysql",
    host: "localhost"
});

export default db;