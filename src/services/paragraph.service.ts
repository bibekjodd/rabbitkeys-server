import { db } from '@/config/database';
import { BadRequestException } from '@/lib/exceptions';
import { Paragraph, paragraphs } from '@/schemas/paragraph.schema';

export const generateParagraph = async (
  skipParagraphId?: string
): Promise<Paragraph> => {
  const randomIndex = Math.floor(Math.random() * 100);
  const [paragraph1, paragraph2] = await db
    .select()
    .from(paragraphs)
    .offset(randomIndex)
    .limit(2);

  if (!paragraph1 || !paragraph2)
    throw new BadRequestException('Could not generate paragraph');

  if (paragraph1.id !== skipParagraphId) return paragraph1;
  return paragraph2;
};
