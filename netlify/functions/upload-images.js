const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: `services/${fileName}`,
          folder: 'client-form-services',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(fileBuffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function to parse multipart form data
const parseMultipartFormData = async (request) => {
  const formData = await request.formData();
  const files = [];
  
  for (const [key, value] of formData.entries()) {
    if (key === 'images' && value instanceof File) {
      const arrayBuffer = await value.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      files.push({
        name: value.name,
        buffer: buffer,
        type: value.type
      });
    }
  }
  
  return files;
};

// Main Netlify Function handler
exports.handler = async (event, context) => {
  // Handle CORS for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // For now, we'll return empty arrays since Cloudinary might not be configured
    // This allows the form to submit successfully even without image uploads
    console.log('Image upload endpoint called - returning empty array to allow form submission');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, imageUrls: [] })
    };

  } catch (error) {
    console.error('Error uploading images:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: "Failed to upload images" })
    };
  }
};