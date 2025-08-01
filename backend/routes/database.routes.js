import {Router} from 'express';
import {
  getDatabase,
  createMember,
  updateMember,
  deleteMember
} from '../controllers/database.controller.js';
import databaseValidators from '../middleware/validate.database.js';

const router = Router();

router.get('/', getDatabase);
router.post('/', databaseValidators.validateCreateMember, createMember);
router.put('/:id', databaseValidators.validateUpdateMember, updateMember);
router.delete('/:id', databaseValidators.validateMemberId, deleteMember);

export default router;