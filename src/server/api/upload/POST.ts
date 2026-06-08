import type { Request, Response } from 'express';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  try {
    // Expects JSON body: { dataUrl: "data:image/jpeg;base64,..." }
    const { dataUrl } = req.body as { dataUrl?: string };

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const matches = dataUrl.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Malformed data URL' });
    }

    const ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
    const buffer = Buffer.from(matches[3], 'base64');
    const filename = `listing-${randomBytes(8).toString('hex')}.${ext}`;
    const uploadDir = '/shared-storage/public/assets/uploads/listings';

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    res.json({ url: `/airo-assets/uploads/listings/${filename}` });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: String(error) });
  }
}
