import express from "express";
import { getProfessor } from "../controllers/Professors.js";

const router = express.Router();

router.get('/professors', getProfessor);

export default router;