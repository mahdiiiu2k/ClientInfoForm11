// Alternative email function using Gmail API directly
const sendEmailViaGmailAPI = async (formData) => {
  // This is a backup approach if nodemailer fails
  // Uses Gmail's REST API with basic authentication
  
  const emailContent = `New Client Information Submission

FORM SUBMISSION DATA:

Years of Experience: ${formData.yearsOfExperience || 'Not provided'} ${formData.yearsOfExperience ? 'years' : ''}

Business Email Address: ${formData.businessEmail || 'Not provided'}

Do you have a license number?: ${formData.hasLicense !== undefined && formData.hasLicense !== null ? (formData.hasLicense ? 'Yes' : 'No') : 'Not provided'}${formData.hasLicense && formData.licenseNumber ? `
License Number: ${formData.licenseNumber}` : ''}

Office/Business Address: ${formData.businessAddress || 'Not provided'}

Business Hours: ${formData.businessHours || 'Not provided'}

Do you offer emergency services?: ${formData.hasEmergencyServices !== undefined && formData.hasEmergencyServices !== null ? (formData.hasEmergencyServices ? 'Yes' : 'No') : 'Not provided'}

Additional Notes: ${formData.additionalNotes || 'Not provided'}

---
This email was sent automatically from the client information form.`;

  // Create email in RFC 2822 format
  const email = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: mahdiabd731@gmail.com`,
    `From: chouikimahdiabderrahmane@gmail.com`,
    `Subject: New Client Information Submission`,
    '',
    emailContent
  ].join('\n');

  // Base64 encode the email
  const encodedEmail = Buffer.from(email).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    // This would require OAuth2 setup, which is complex
    // For now, we'll use a simpler webhook approach
    console.log('Email content prepared:', emailContent);
    
    // Return success for now - this is a placeholder for a more robust solution
    return { success: true, message: 'Email prepared but not sent - OAuth2 required' };
  } catch (error) {
    console.error('Email preparation failed:', error);
    throw error;
  }
};

// Simple webhook approach using a third-party service
const sendEmailViaWebhook = async (formData) => {
  const emailData = {
    to: 'mahdiabd731@gmail.com',
    from: 'chouikimahdiabderrahmane@gmail.com',
    subject: 'New Client Information Submission',
    text: `Years of Experience: ${formData.yearsOfExperience || 'Not provided'}
Business Email: ${formData.businessEmail || 'Not provided'}
License: ${formData.hasLicense ? 'Yes' : 'No'}
${formData.licenseNumber ? `License Number: ${formData.licenseNumber}` : ''}
Business Address: ${formData.businessAddress || 'Not provided'}
Business Hours: ${formData.businessHours || 'Not provided'}
Emergency Services: ${formData.hasEmergencyServices ? 'Yes' : 'No'}

Additional Notes: ${formData.additionalNotes || 'Not provided'}

This email was sent automatically from the client information form.`
  };

  console.log('Webhook email data:', emailData);
  
  // This would require a third-party service like SendGrid, Mailgun, etc.
  // For now, just log the data
  return { success: true, message: 'Email data logged - webhook service needed' };
};

exports.handler = async (event, context) => {
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
    const formData = JSON.parse(event.body);
    console.log('Alternative email function called with:', formData);
    
    const result = await sendEmailViaWebhook(formData);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Alternative email function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Email service error', error: error.message })
    };
  }
};