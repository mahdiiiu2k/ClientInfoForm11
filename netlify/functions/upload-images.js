const cloudinary = require('cloudinary').v2;
const multipart = require('parse-multipart-data');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add debug logging for Netlify
const log = (message, data = null) => {
  console.log(`[UPLOAD-IMAGES] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Upload single image to Cloudinary
const uploadToCloudinary = async (fileBuffer, fileName) => {
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
    log('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Main Netlify Function handler
exports.handler = async (event, context) => {
  log('Upload function invoked', { 
    method: event.httpMethod, 
    contentType: event.headers['content-type'],
    hasBody: !!event.body 
  });

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
    log('Method not allowed:', event.httpMethod);
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
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      log('Cloudinary environment variables missing');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'Cloudinary not configured properly',
          error: 'Missing environment variables' 
        })
      };
    }

    // Parse multipart form data
    const contentType = event.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      log('Invalid content type:', contentType);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' })
      };
    }

    // Extract boundary from content type
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      log('No boundary found in content type');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'No boundary found in multipart data' })
      };
    }

    // Parse the multipart data
    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const parts = multipart.parse(bodyBuffer, boundary);

    if (!parts || parts.length === 0) {
      log('No files found in multipart data');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'No files uploaded' })
      };
    }

    log(`Processing ${parts.length} file(s)`);

    // Upload all images to Cloudinary
    const uploadPromises = parts.map(async (part, index) => {
      if (part.name === 'images' && part.data && part.filename) {
        const fileName = `${Date.now()}-${index}-${part.filename}`;
        log(`Uploading file: ${fileName}`);
        const cloudinaryUrl = await uploadToCloudinary(part.data, fileName);
        log(`Successfully uploaded: ${cloudinaryUrl}`);
        return cloudinaryUrl;
      }
      return null;
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.filter(url => url !== null);

    log(`Successfully uploaded ${imageUrls.length} images`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true, 
        imageUrls: imageUrls,
        message: `Successfully uploaded ${imageUrls.length} images`
      })
    };

  } catch (error) {
    log('Upload function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};