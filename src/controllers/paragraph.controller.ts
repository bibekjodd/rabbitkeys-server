import { db } from '@/config/database';
import { env } from '@/config/env.config';
import { NotFoundException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { paragraphs } from '@/schemas/paragraph.schema';
import { generateParagraph } from '@/services/paragraph.service';
import { eq } from 'drizzle-orm';

export const generateRandomParagraph = handleAsync<
  unknown,
  unknown,
  unknown,
  { skip?: string }
>(async (req, res) => {
  const skipParagraphId = req.query.skip;
  const paragraph = await generateParagraph(skipParagraphId);

  if (env.NODE_ENV === 'development') {
    paragraph.text = paragraph.text.slice(0, 30);
  }
  return res.json({ paragraph });
});

export const generateParagraphById = handleAsync<{ id: string }>(
  async (req, res) => {
    const paragraphId = req.params.id;
    const [paragraph] = await db
      .select()
      .from(paragraphs)
      .where(eq(paragraphs.id, paragraphId));
    if (!paragraph) throw new NotFoundException('Paragaraph not found');

    if (env.NODE_ENV === 'development') {
      paragraph.text = paragraph.text.slice(0, 30);
    }
    return res.json({ paragraph });
  }
);
