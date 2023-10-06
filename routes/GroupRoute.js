import express from "express";
import { verifyUser } from "../middleware/AuthUser.js";
import {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup
} from "../controllers/Groups.js";

const router = express.Router();

router.get('/groups',verifyUser, getGroups);
router.get('/groups/:id',verifyUser, getGroupById);
router.post('/groups',verifyUser, createGroup);
router.patch('/groups/:id',verifyUser, updateGroup);
router.delete('/groups/:id',verifyUser, deleteGroup);

export default router;