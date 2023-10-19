import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/Database.js";
import session from "express-session";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import GroupRoute from "./routes/GroupRoute.js";
import StudentRoute from "./routes/StudentRoute.js"
import SequelizeStore from "connect-session-sequelize";
import ProfessorRoute from "./routes/ProfessorRoute.js";
import AssignmentRoute from "./routes/AssignmentRoute.js";
dotenv.config({path: `env.${process.env.NODE_ENV}`});

const app = express();
const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({ db: db });

//Create All DB Resources
// (async()=>{
//     await db.sync({force: true});
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
app.use("/api/v1", StudentRoute);
app.use("/api/v1", AssignmentRoute);

// store.sync();

app.listen(process.env.APP_PORT, ()=> {
    console.log(`Server up and running in port ${process.env.APP_PORT}...`);
});
