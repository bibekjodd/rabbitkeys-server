import {
  generateParagraphById,
  generateRandomParagraph
} from '@/controllers/paragraph.controller';
import { Router } from 'express';

const router = Router();
export const paragraphsRoute = router;

router.get('/random', generateRandomParagraph);
router.get('/:id', generateParagraphById);
