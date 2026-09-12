// =============================================
// Cloudflare Worker - Messages/Audio Routes (Branch Prefixed R2)
// =============================================

import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = new Hono();

// =============================================
// Helper: Generate unique filename
// =============================================
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
};

// =============================================
// POST /api/messages/upload - Upload audio file
// =============================================
router.post('/upload', authMiddleware, adminMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const speaker = formData.get('speaker') || 'Unknown';
    const category = formData.get('category');
    const date = formData.get('date');

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!title || !category || !date) {
      return c.json({ error: 'Title, category, and date are required' }, 400);
    }

    // Convert to buffer
    const buffer = await file.arrayBuffer();
    const fileName = generateFileName(file.name);
    const key = `branch-dgu-upgrade/audio-messages/${fileName}`;

    // Upload to R2 with branch prefix
    const uploadRes = await c.env.R2_BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    if (!uploadRes) {
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Return success with metadata
    const audioUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

    return c.json(
      {
        message: '✅ Audio file uploaded successfully',
        audio: {
          id: uuidv4(),
          title,
          speaker,
          category,
          date,
          file_name: fileName,
          file_url: audioUrl,
          file_size: buffer.byteLength,
          uploaded_by: c.get('userId'),
          branch: 'dgu-upgrade',
          uploaded_at: new Date().toISOString(),
        },
      },
      201
    );
  } catch (err) {
    console.error('Audio upload error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/messages - Get all messages (admin only)
// =============================================
router.get('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    // List files from R2 with branch prefix
    const list = await c.env.R2_BUCKET.list({ prefix: 'branch-dgu-upgrade/audio-messages/' });

    const messages = list.objects.map((obj) => ({
      id: obj.key.split('/').pop(),
      file_name: obj.key.split('/').pop(),
      file_url: `${c.env.R2_PUBLIC_URL}/${obj.key}`,
      file_size: obj.size,
      uploaded_at: obj.uploaded,
      mime_type: obj.httpMetadata?.contentType,
    }));

    return c.json({
      messages,
      count: messages.length,
    });
  } catch (err) {
    console.error('Messages fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/messages/public/all - Get public messages
// =============================================
router.get('/public/all', async (c) => {
  try {
    // List files from R2 with branch prefix
    const list = await c.env.R2_BUCKET.list({ prefix: 'branch-dgu-upgrade/audio-messages/' });

    const limit = parseInt(c.req.query('limit')) || 50;
    const messages = list.objects
      .slice(0, limit)
      .map((obj) => ({
        id: obj.key.split('/').pop(),
        file_name: obj.key.split('/').pop(),
        file_url: `${c.env.R2_PUBLIC_URL}/${obj.key}`,
        file_size: obj.size,
        uploaded_at: obj.uploaded,
      }));

    return c.json({
      messages,
      count: messages.length,
    });
  } catch (err) {
    console.error('Public messages fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// DELETE /api/messages/:id - Delete audio message
// =============================================
router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { id } = c.req.param();

    // Delete from R2
    const key = `branch-dgu-upgrade/audio-messages/${id}`;
    await c.env.R2_BUCKET.delete(key);

    return c.json({
      message: '✅ Audio message deleted successfully',
    });
  } catch (err) {
    console.error('Delete error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
