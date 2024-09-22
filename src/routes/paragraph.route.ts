import {
  generateParagraphById,
  generateRandomParagraph
} from '@/controllers/paragraph.controller';
import { Router } from 'express';

const router = Router();
export const paragraphRoute = router;

router.get('/', generateRandomParagraph);
router.get('/:id', generateParagraphById);
