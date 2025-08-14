# Fix Email Issue on Netlify Deployment

## The Problem
Your website shows "sent successful" but emails aren't being received because Netlify doesn't have access to your Gmail app password.

## Solution: Add Environment Variable to Netlify

### Step 1: Get Your Gmail App Password
If you don't have one yet:
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Search for "App passwords" 
4. Generate a new app password for "Mail"
5. Copy the 16-character password (example: `abcd efgh ijkl mnop`)

### Step 2: Add to Netlify Dashboard
1. Go to your Netlify dashboard
2. Click on your deployed site
3. Go to "Site settings"
4. Click "Environment variables" in the left menu
5. Click "Add a variable"
6. Add:
   - **Key:** `GMAIL_APP_PASSWORD`
   - **Value:** Your 16-character app password (without spaces)
7. Click "Save"

### Step 3: Redeploy Your Site
1. Go to the "Deploys" tab in Netlify
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

## Test the Fix
After redeployment:
1. Fill out your form completely
2. Submit the form
3. Check both your email accounts:
   - The email should be sent FROM: chouikimahdiabderrahmane@gmail.com
   - The email should be sent TO: mahdiabd731@gmail.com

## If Still Not Working
Check the Netlify function logs:
1. Go to Netlify dashboard → Your site → Functions tab
2. Click on "client-submissions"
3. Check the logs for error messages
4. Look for any authentication errors or missing environment variable messages

The logs will show exactly what's happening when someone submits the form.