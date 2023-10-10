import express from "express";
import { getStudent } from "../controllers/Students.js";

const router = express.Router();

router.get('/students', getStudent);

export default router;