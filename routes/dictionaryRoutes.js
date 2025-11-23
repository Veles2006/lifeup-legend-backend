import express from 'express';
import { getWord } from '../controllers/dictionaryController.js';

const router = express.Router();

router.get('/:word', getWord);

export default router;
