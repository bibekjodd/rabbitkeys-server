import { db } from '@/config/database';
import { env } from '@/config/env.config';
import { NotFoundException } from '@/lib/exceptions';
import { paragraphs } from '@/schemas/paragraphs.schema';
import { generateParagraph } from '@/services/paragraphs.services';
import { eq } from 'drizzle-orm';
import { RequestHandler } from 'express';

export const generateRandomParagraph: RequestHandler<
  unknown,
  unknown,
  unknown,
  { skip?: string }
> = async (req, res) => {
  const skipParagraphId = req.query.skip;
  const paragraph = await generateParagraph(skipParagraphId);

  if (env.NODE_ENV === 'development') {
    paragraph.text = paragraph.text.slice(0, 30);
  }
  res.json({ paragraph });
};

export const generateParagraphById: RequestHandler<{ id: string }> = async (req, res) => {
  const paragraphId = req.params.id;
  const [paragraph] = await db.select().from(paragraphs).where(eq(paragraphs.id, paragraphId));
  if (!paragraph) throw new NotFoundException('Paragaraph not found');

  if (env.NODE_ENV === 'development') {
    paragraph.text = paragraph.text.slice(0, 30);
  }
  res.json({ paragraph });
};
