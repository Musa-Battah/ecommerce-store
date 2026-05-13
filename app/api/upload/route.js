import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Smart upload configuration
const UPLOAD_CONFIG = {
  folder: 'ecommerce-products',
  transformation: [
    { quality: 'auto:good', fetch_format: 'auto' }, // Auto compress
    { width: 800, crop: 'limit' }, // Max width 800px
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  max_file_size: 2 * 1024 * 1024, // 2MB limit (strict!)
  unique_filename: true,
  overwrite: false
};

export async function POST(request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Check file size (strict 2MB limit)
    if (file.size > UPLOAD_CONFIG.max_file_size) {
      return NextResponse.json({ 
        error: 'File too large. Max 2MB allowed.' 
      }, { status: 400 });
    }
    
    // Check file type
    const fileType = file.type.split('/')[1];
    if (!UPLOAD_CONFIG.allowed_formats.includes(fileType)) {
      return NextResponse.json({ 
        error: 'Invalid file format. Use JPG, PNG, or WEBP.' 
      }, { status: 400 });
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary with smart settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        UPLOAD_CONFIG,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Convert buffer to stream
      const Readable = require('stream').Readable;
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed. Please try again.' 
    }, { status: 500 });
  }
}

// Delete product image (when product is deleted)
export async function DELETE(request) {
  try {
    const { publicId } = await request.json();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}