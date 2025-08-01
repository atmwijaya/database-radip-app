import express from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  addParticipant
} from '../controllers/activity.controller.js';
import { validateMember } from '../middleware/validate.activity.js';

const router = express.Router();

router.get('/', validateMember, getActivities);
router.post('/', validateMember, createActivity);
router.put('/:id', validateMember, updateActivity);
router.delete('/:id', validateMember, deleteActivity);
router.post('/:activityId/participants/:memberId', validateMember, addParticipant);

export default router;