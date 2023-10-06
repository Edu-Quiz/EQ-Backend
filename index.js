import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import GroupRoute from "./routes/GroupRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import ProfessorRoute from "./routes/ProfessorRoute.js";
dotenv.config({path: `env.${process.env.NODE_ENV}`});

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

//Create All DB Resources
// (async()=>{
//     await db.sync();
// })();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}));

app.use(cors({
    credentials: true,
    origin: `${process.env.CORS_ORIGIN}`
}));
app.use(express.json());
app.use("/api/v1", UserRoute);
app.use("/api/v1", GroupRoute);
app.use("/api/v1", AuthRoute);
app.use("/api/v1", ProfessorRoute);

// store.sync();

app.listen(process.env.APP_PORT, ()=> {
    console.log(`Server up and running in port ${process.env.APP_PORT}...`);
});
