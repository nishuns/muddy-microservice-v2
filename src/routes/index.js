// src/routes/index.js
import { Router } from 'express';
import muddyRoutes from './muddyRoutes.js';

const router = Router();

// Mount muddy routes
router.use('/muddy', muddyRoutes);

export default router;
