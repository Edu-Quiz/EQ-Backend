import express from "express";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";
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
router.post('/groups',adminOnly, createGroup);
router.patch('/groups/:id',adminOnly, updateGroup);
router.delete('/groups/:id',adminOnly, deleteGroup);

export default router;