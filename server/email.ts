import nodemailer from 'nodemailer';

export interface EmailData {
  yearsOfExperience?: number;
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
    
    // Build email content starting with years of experience
    let emailContent = `
New Client Information Submission

=== FORM DATA ===

`;

    if (formData.yearsOfExperience !== undefined) {
      emailContent += `Years of Experience: ${formData.yearsOfExperience} years\n`;
    }

    emailContent += `
=== END OF FORM DATA ===

This email was automatically generated from the client information form.
    `;

    const mailOptions = {
      from: 'chouikimahdiabderrahmane@gmail.com',
      to: 'mahdiabd731@gmail.com',
      subject: 'New Client Information Form Submission',
      text: emailContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};