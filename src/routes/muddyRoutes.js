// src/routes/muddyRoutes.js
import { Router } from 'express';
import {
  createThreadController,
  addInstructionController,
  streamController,
  speechToText,
  ttsStream
} from '../controllers/muddyControllers.js';
import multer from 'multer';

// Multer storage configuration to save files with .wav extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
}); 

const upload = multer({ storage: storage });

const router = Router();

router.get('/create-thread', createThreadController);
router.post('/add-instruction', addInstructionController);
router.post('/stream', streamController);
router.post('/speech-to-text', upload.single('file'), speechToText);
router.post('/tts-stream', ttsStream)

export default router;
