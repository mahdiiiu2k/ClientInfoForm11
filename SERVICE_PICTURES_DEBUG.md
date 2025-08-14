# Service Pictures Debugging Guide

## Issue
Service pictures are not showing up in emails when deployed to Netlify, even though they're being uploaded.

## Debugging Steps Added

### 1. Frontend Debugging
- Added logging in `uploadImages` function to show which endpoint is being used
- Added logging to show upload results

### 2. Netlify Function Debugging
- Added detailed logging in `client-submissions.js` to show:
  - Services data received from frontend
  - Individual service details including `pictureUrls`
  - Email content generation process

### 3. Upload Function Debugging  
- Created `upload-images.js` Netlify function with comprehensive logging
- Added logging for each step of the image upload process

## How to Debug (For User)

### Step 1: Check Netlify Function Logs
1. Go to Netlify Dashboard → Your Site → Functions
2. Click on `client-submissions` function
3. Look at recent invocations and logs
4. Check for these specific log entries:
   - "Services data received"
   - "Service X details" (for each service)
   - "[EMAIL-DEBUG] Service X" (during email generation)

### Step 2: Check Upload Function Logs
1. Go to Netlify Dashboard → Your Site → Functions  
2. Click on `upload-images` function
3. Look for:
   - "Processing X file(s)"
   - "Successfully uploaded: [URL]"
   - Any error messages

### Step 3: Test the Process
1. Add a service with pictures on your deployed site
2. Submit the form
3. Check both function logs immediately after submission
4. Look for the service data in the logs

## Expected Data Flow

1. **Upload Images**: `/.netlify/functions/upload-images`
   - Should return: `{success: true, imageUrls: ["https://cloudinary.com/..."]}`

2. **Process Services**: Frontend `onSubmit` function
   - Should create: `{name: "...", description: "...", pictureUrls: ["https://cloudinary.com/..."]}`

3. **Send to Netlify**: `/.netlify/functions/client-submissions`
   - Should receive services with `pictureUrls` array
   - Should include URLs in email content

## Environment Variables Needed on Netlify

Make sure these are all configured in Netlify Dashboard → Site Settings → Environment Variables:

- `GMAIL_APP_PASSWORD` (for email sending)
- `CLOUDINARY_CLOUD_NAME` (for image uploads)
- `CLOUDINARY_API_KEY` (for image uploads)  
- `CLOUDINARY_API_SECRET` (for image uploads)

## Common Issues & Solutions

### Issue: Upload function not found
- **Solution**: Make sure `upload-images.js` is deployed and `parse-multipart-data` dependency is installed

### Issue: Images upload but URLs not in email
- **Solution**: Check if `pictureUrls` field is being properly passed from frontend to Netlify function

### Issue: "No pictures provided" even with uploads
- **Solution**: Check if the service data structure matches between frontend and email template

After checking the logs, we'll know exactly where the issue is occurring.