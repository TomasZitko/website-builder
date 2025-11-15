import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.array('images', 4); // Max 4 images

/**
 * Upload images to Supabase Storage
 */
export async function uploadChatImages(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    console.log(`📸 Uploading ${files.length} images for user ${userId}`);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `${userId}/${Date.now()}_${file.originalname}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('❌ Failed to upload image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
      console.log('✅ Uploaded:', fileName);
    }

    res.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      error: 'Failed to upload images',
      message: error.message,
    });
  }
}

/**
 * Delete a chat image
 */
export async function deleteChatImage(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { fileName } = req.params;

    // Ensure the file belongs to the user
    if (!fileName.startsWith(`${userId}/`)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase.storage
      .from('chat-images')
      .remove([fileName]);

    if (error) {
      console.error('❌ Failed to delete image:', error);
      throw error;
    }

    console.log('🗑️ Deleted image:', fileName);

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Image delete error:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message,
    });
  }
}
