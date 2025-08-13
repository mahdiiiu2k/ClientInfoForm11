import nodemailer from 'nodemailer';

export interface EmailData {
  yearsOfExperience?: number;
  businessEmail?: string;
  hasLicense?: boolean | null;
  licenseNumber?: string | null;
  businessAddress?: string | null;
  businessHours?: string | null;
  // We'll add more fields here progressively as requested
}

// Gmail configuration using app passwords
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chouikimahdiabderrahmane@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || '', // App password for Gmail
    },
  });
};

export const sendFormEmail = async (formData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Log the form data to debug what's being received
    console.log('Form data received for email:', JSON.stringify(formData, null, 2));
    
    // Build email content with better formatting to prevent truncation
    let emailContent = `New Client Information Submission

FORM SUBMISSION DATA:

Years of Experience: ${formData.yearsOfExperience || 'Not provided'} ${formData.yearsOfExperience ? 'years' : ''}

Business Email Address: ${formData.businessEmail || 'Not provided'}

Do you have a license number?: ${formData.hasLicense !== undefined && formData.hasLicense !== null ? (formData.hasLicense ? 'Yes' : 'No') : 'Not provided'}${formData.hasLicense && formData.licenseNumber ? `
License Number: ${formData.licenseNumber}` : ''}

Office/Business Address: ${formData.businessAddress || 'Not provided'}

Business Hours: ${formData.businessHours || 'Not provided'}

---
This email was sent automatically from the client information form.`;
    
    // Also log the email content to verify what's being sent
    console.log('Email content being sent:', emailContent);

    const mailOptions = {
      from: 'chouikimahdiabderrahmane@gmail.com',
      to: 'mahdiabd731@gmail.com',
      subject: 'New Client Information Form Submission',
      text: emailContent,
      html: `<html><body><pre>${emailContent}</pre></body></html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};