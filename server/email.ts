import nodemailer from 'nodemailer';

export interface EmailData {
  yearsOfExperience?: number;
  businessEmail?: string;
  hasLicense?: boolean | null;
  licenseNumber?: string | null;
  businessAddress?: string | null;
  businessHours?: string | null;
  hasEmergencyServices?: boolean | null;
  hasEmergencyPhone?: boolean | null;
  emergencyPhone?: string | null;
  additionalNotes?: string | null;
  enableAboutModifications?: boolean | null;
  companyStory?: string | null;
  uniqueSellingPoints?: string | null;
  specialties?: string | null;
  services?: Array<{
    name?: string;
    description?: string;
    steps?: string;
    picture?: string;
    pictureUrls?: string[];
  }> | null;
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

Do you offer emergency services?: ${formData.hasEmergencyServices !== undefined && formData.hasEmergencyServices !== null ? (formData.hasEmergencyServices ? 'Yes' : 'No') : 'Not provided'}${formData.hasEmergencyServices ? `
Do you have a specific phone number for emergencies?: ${formData.hasEmergencyPhone !== undefined && formData.hasEmergencyPhone !== null ? (formData.hasEmergencyPhone ? 'Yes' : 'No') : 'Not provided'}${formData.hasEmergencyPhone && formData.emergencyPhone ? `
Emergency Phone Number: ${formData.emergencyPhone}` : ''}` : ''}

Additional Notes: ${formData.additionalNotes || 'Not provided'}

About Us Section Customization: ${formData.enableAboutModifications !== undefined && formData.enableAboutModifications !== null ? (formData.enableAboutModifications ? 'Yes' : 'No') : 'Not provided'}${formData.enableAboutModifications ? `

Company Story/Background: ${formData.companyStory || 'Not provided'}

What Sets You Apart: ${formData.uniqueSellingPoints || 'Not provided'}

Specific Specialties: ${formData.specialties || 'Not provided'}` : ''}

Services: ${formData.services && formData.services.length > 0 ? `
${formData.services.map((service, index) => `
Service ${index + 1}:
  Name: ${service.name || 'Not provided'}
  Description: ${service.description || 'Not provided'}
  Executing Steps: ${service.steps || 'Not provided'}
  Service Pictures: ${service.pictureUrls && service.pictureUrls.length > 0 ? service.pictureUrls.join(', ') : (service.picture || 'Not provided')}`).join('\n')}` : 'No services added'}

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