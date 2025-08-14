# Netlify Deployment Guide

## Overview
This project has been configured for deployment on Netlify with full email functionality. The backend has been converted to Netlify Functions to work in a serverless environment.

## Deployment Steps

### 1. Prepare Your Repository
- Push all your code to a Git repository (GitHub, GitLab, or Bitbucket)
- Make sure all the Netlify configuration files are included:
  - `netlify.toml` (build configuration)
  - `netlify/functions/` (serverless functions with package.json)
  - `client/public/_redirects` (routing configuration)
  - `.env.example` (environment variables template)

### 2. Set Up Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your Git provider and select your repository
4. Netlify will automatically detect the build settings from `netlify.toml`
5. Click "Deploy site"

### 3. Configure Environment Variables
In your Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add the following required variables:

**Required for email functionality:**
- `GMAIL_APP_PASSWORD` = Your Gmail App Password

**Optional for image uploads:**
- `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` = Your Cloudinary API key  
- `CLOUDINARY_API_SECRET` = Your Cloudinary API secret

### 4. Gmail App Password Setup
To get a Gmail App Password:
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings → Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as your `GMAIL_APP_PASSWORD`

### 5. Troubleshoot Email Issues
If emails aren't being sent after deployment:

1. **Check Netlify Function Logs:**
   - Go to your Netlify dashboard → Functions tab
   - Click on `client-submissions` function
   - Check the logs for errors

2. **Verify Environment Variables:**
   - Ensure `GMAIL_APP_PASSWORD` is correctly set in Netlify
   - The password should be a 16-character Gmail App Password

3. **Test the Function:**
   - Visit your site and submit the form
   - Check the function logs for detailed error messages

### 6. Test Your Deployment
After deployment:
1. Visit your Netlify site URL
2. Fill out the form with test data
3. Submit the form
4. Check that the email is sent to mahdiabd731@gmail.com
5. If not working, check the function logs in Netlify dashboard

## Features Included
✅ **Full email functionality** - Forms send emails from chouikimahdiabderrahmane@gmail.com to mahdiabd731@gmail.com  
✅ **Form submission works** - Even if image uploads fail, the email will still be sent  
✅ **Serverless architecture** - Uses Netlify Functions for backend processing  
✅ **CORS configured** - Frontend and backend communicate properly  
✅ **Environment variables** - Secure handling of sensitive credentials  

## Troubleshooting
- If emails aren't sending, check that `GMAIL_APP_PASSWORD` is correctly set
- If the form submission fails, check the Netlify Functions logs
- Image uploads are optional - form will work without Cloudinary configuration

## Technical Details
- Frontend: React + Vite (static build)
- Backend: Netlify Functions (Node.js serverless)
- Email: Nodemailer with Gmail
- Images: Cloudinary (optional)
- Database: Not used (form submissions trigger emails directly)