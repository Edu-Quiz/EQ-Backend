import express from "express";
import { verifyUser } from "../middleware/AuthUser.js";
import { createAssignment, getAssignments, getAssignmentById, updateAssignment, deleteAssignment, insertStudentScore, getScoresForAssignment } from "../controllers/Assignments.js";

const router = express.Router();

router.get('/assignments',verifyUser, getAssignments);
router.get('/assignments/:id',verifyUser, getAssignmentById);
router.get('/assignments/getScores/:id',verifyUser, getScoresForAssignment);
router.post('/assignments',verifyUser, createAssignment);
router.post('/assignments/setScore',verifyUser, insertStudentScore);
router.patch('/assignments/:id',verifyUser, updateAssignment);
router.delete('/assignments/:id',verifyUser, deleteAssignment);

export default router;