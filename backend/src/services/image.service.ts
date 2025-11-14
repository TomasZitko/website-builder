/**
 * Image Upload Service
 *
 * Handles image uploads for chat and website assets
 * Supports: S3, Cloudflare R2, Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { WebsiteImage, ImageUploadResult } from '../types/production.types';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BUCKET_NAME = 'website-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/**
 * Upload image to storage
 */
export async function uploadImage(
  file: Express.Multer.File,
  websiteId: string,
  chatSessionId?: string,
  aiDescription?: string
): Promise<ImageUploadResult> {
  try {
    // Validate file
    validateImage(file);

    // Generate unique filename
    const filename = generateFilename(file.originalname);
    const filePath = `${websiteId}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const storageUrl = urlData.publicUrl;

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('website_images')
      .insert({
        website_id: websiteId,
        filename,
        original_filename: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_url: storageUrl,
        storage_provider: 's3',
        uploaded_via_chat: !!chatSessionId,
        chat_session_id: chatSessionId || null,
        ai_description: aiDescription || null,
        used_in_page: false
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`✅ Image uploaded: ${filename} (${file.size} bytes)`);

    return {
      id: imageRecord.id,
      filename,
      storage_url: storageUrl,
      file_size: file.size,
      mime_type: file.mimetype
    };
  } catch (error: any) {
    console.error('❌ Image upload failed:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: Express.Multer.File[],
  websiteId: string,
  chatSessionId?: string
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadImage(file, websiteId, chatSessionId);
      results.push(result);
    } catch (error: any) {
      console.error(`Failed to upload ${file.originalname}:`, error.message);
      // Continue with other files
    }
  }

  return results;
}

/**
 * Get images for a website
 */
export async function getWebsiteImages(
  websiteId: string,
  userId: string
): Promise<WebsiteImage[]> {
  // Verify ownership
  const { data: website } = await supabase
    .from('websites')
    .select('user_id')
    .eq('id', websiteId)
    .single();

  if (!website || website.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  const { data: images, error } = await supabase
    .from('website_images')
    .select('*')
    .eq('website_id', websiteId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }

  return images || [];
}

/**
 * Delete image
 */
export async function deleteImage(
  imageId: string,
  userId: string
): Promise<void> {
  // Get image record
  const { data: image, error: fetchError } = await supabase
    .from('website_images')
    .select('*, websites!inner(user_id)')
    .eq('id', imageId)
    .single();

  if (fetchError || !image) {
    throw new Error('Image not found');
  }

  // Verify ownership
  if ((image.websites as any).user_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete from storage
  const filePath = `${image.website_id}/${image.filename}`;
  await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  // Delete from database
  await supabase.from('website_images').delete().eq('id', imageId);

  console.log(`✅ Image deleted: ${image.filename}`);
}

/**
 * Update image metadata
 */
export async function updateImageMetadata(
  imageId: string,
  userId: string,
  updates: {
    alt_text?: string;
    used_in_page?: boolean;
    ai_description?: string;
  }
): Promise<void> {
  // Verify ownership
  const { data: image } = await supabase
    .from('website_images')
    .select('*, websites!inner(user_id)')
    .eq('id', imageId)
    .single();

  if (!image || (image.websites as any).user_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Update metadata
  await supabase
    .from('website_images')
    .update(updates)
    .eq('id', imageId);
}

/**
 * Mark images as used in page (called when website is saved)
 */
export async function markImagesAsUsed(
  websiteId: string,
  imageUrls: string[]
): Promise<void> {
  // First, mark all as unused
  await supabase
    .from('website_images')
    .update({ used_in_page: false })
    .eq('website_id', websiteId);

  // Then mark specified ones as used
  if (imageUrls.length > 0) {
    await supabase
      .from('website_images')
      .update({ used_in_page: true })
      .eq('website_id', websiteId)
      .in('storage_url', imageUrls);
  }
}

/**
 * Cleanup unused images (run daily via cron)
 */
export async function cleanupUnusedImages(): Promise<number> {
  try {
    // Delete images not used in pages after 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const { data: unusedImages } = await supabase
      .from('website_images')
      .select('*')
      .eq('used_in_page', false)
      .lt('created_at', cutoffDate.toISOString());

    if (!unusedImages || unusedImages.length === 0) {
      return 0;
    }

    // Delete from storage
    const filePaths = unusedImages.map(
      img => `${img.website_id}/${img.filename}`
    );
    await supabase.storage.from(BUCKET_NAME).remove(filePaths);

    // Delete from database
    const imageIds = unusedImages.map(img => img.id);
    await supabase
      .from('website_images')
      .delete()
      .in('id', imageIds);

    console.log(`✅ Cleaned up ${unusedImages.length} unused images`);
    return unusedImages.length;
  } catch (error) {
    console.error('Failed to cleanup unused images:', error);
    return 0;
  }
}

//═══════════════════════════════════════════════════════════
// Helper Functions
//═══════════════════════════════════════════════════════════

/**
 * Validate image file
 */
function validateImage(file: Express.Multer.File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Check file exists
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error('Empty file');
  }
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}.${ext}`;
}

/**
 * Optimize image (future enhancement)
 * Use Sharp or similar to resize/compress images
 */
export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<Buffer> {
  // TODO: Implement with Sharp library
  // For now, return original buffer
  return buffer;
}
