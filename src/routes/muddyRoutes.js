// src/routes/muddyRoutes.js
import { Router } from 'express';
import {
  createThreadController,
  addInstructionController,
  streamController,
} from '../controllers/muddyControllers.js';

const router = Router();

router.get('/create-thread', createThreadController);
router.post('/add-instruction', addInstructionController);
router.post('/stream', streamController);

export default router;
