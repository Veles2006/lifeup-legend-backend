import express from 'express';
import { getWord, searchWord } from '../controllers/dictionaryController.js';

const router = express.Router();

// router.get('/search', searchWord);
router.get('/:word', getWord);

export default router;
