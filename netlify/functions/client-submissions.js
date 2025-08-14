const nodemailer = require('nodemailer');

// Add debug logging for Netlify
const log = (message, data = null) => {
  console.log(`[CLIENT-SUBMISSIONS] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// SendGrid fallback option
const sendWithSendGrid = async (formData) => {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailContent = buildEmailContent(formData);
    
    const msg = {
      to: 'mahdiabd731@gmail.com',
      from: 'chouikimahdiabderrahmane@gmail.com', // Must be verified in SendGrid
      subject: 'New Client Information Submission',
      text: emailContent,
    };

    log('Attempting SendGrid email send...');
    await sgMail.send(msg);
    log('SendGrid email sent successfully');
    return { success: true, method: 'sendgrid' };
  } catch (error) {
    log('SendGrid failed:', error);
    throw error;
  }
};

// Build email content function to avoid duplication
const buildEmailContent = (formData) => {
  return `New Client Information Submission

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

Specialties: ${formData.specialties || 'Not provided'}` : ''}

Services: ${formData.services && formData.services.length > 0 ? formData.services.map(service => `
- ${service.name}: ${service.description}${service.imageUrl ? ' (Image attached)' : ''}`).join('') : 'No services added'}

Previous Projects: ${formData.projects && formData.projects.length > 0 ? formData.projects.map(project => `
- ${project.name}: ${project.description}${project.beforeImageUrl || project.afterImageUrl ? ' (Images attached)' : ''}`).join('') : 'No projects added'}

Service Areas: ${formData.serviceAreas && formData.serviceAreas.length > 0 ? formData.serviceAreas.map(area => `
- ${area.name}: ${area.description}`).join('') : 'No service areas added'}

Financing Options: ${formData.financingOptions && formData.financingOptions.length > 0 ? formData.financingOptions.map(option => `
- ${option.name}: ${option.description}`).join('') : 'No financing options added'}

Storm Services: ${formData.stormServices && formData.stormServices.length > 0 ? formData.stormServices.map(service => `
- ${service.name}: ${service.description}`).join('') : 'No storm services added'}

Brands You Work With: ${formData.brands && formData.brands.length > 0 ? formData.brands.map(brand => `
- ${brand.name}: ${brand.description}`).join('') : 'No brands added'}

Certifications & Awards: ${formData.certifications && formData.certifications.length > 0 ? formData.certifications.map(cert => `
- ${cert.name}: ${cert.description}${cert.imageUrl ? ' (Image attached)' : ''}`).join('') : 'No certifications added'}

Installation Process: ${formData.installationProcessServices && formData.installationProcessServices.length > 0 ? formData.installationProcessServices.map(process => `
- ${process.name}: ${process.description}`).join('') : 'No installation process services added'}

Roof Maintenance Guide: ${formData.hasMaintenanceGuide ? 'Yes' : 'No'}${formData.maintenanceGuide ? `
Guide: ${formData.maintenanceGuide}` : ''}

Roof Materials and Brands: ${formData.hasRoofMaterials ? 'Yes' : 'No'}${formData.roofMaterialsDetails ? `
Details: ${formData.roofMaterialsDetails}` : ''}${formData.roofMaterialsSpecialties ? `
Specialties: ${formData.roofMaterialsSpecialties}` : ''}

Warranty Coverage: ${formData.hasWarranty ? 'Yes' : 'No'}${formData.warrantyDescription ? `
Description: ${formData.warrantyDescription}` : ''}${formData.warrantyDuration ? `
Duration: ${formData.warrantyDuration}` : ''}

Insurance Coverage: ${formData.hasInsurance ? 'Yes' : 'No'}${formData.generalLiability ? `
General Liability: ${formData.generalLiability}` : ''}${formData.workersCompensation ? `
Workers Compensation: Yes` : ''}

Notes/Additional Features: ${formData.warrantyTerms && formData.warrantyTerms.length > 0 ? formData.warrantyTerms.map(term => `
- ${term.name}: ${term.description}`).join('') : 'No'}

---
This email was sent automatically from the client information form.`;
};

// Email sending function
const sendFormEmail = async (formData) => {
  const createTransporter = () => {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'chouikimahdiabderrahmane@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '', // App password for Gmail
      },
    });
  };

  try {
    log('Starting email sending process');
    log('Environment check - GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
    
    // Check if Gmail app password is configured
    if (!process.env.GMAIL_APP_PASSWORD) {
      throw new Error('GMAIL_APP_PASSWORD environment variable is not configured in Netlify');
    }
    
    const transporter = createTransporter();
    
    // Use shared email content builder
    const emailContent = buildEmailContent(formData);

    log('Email content being sent:', emailContent);

    const mailOptions = {
      from: 'chouikimahdiabderrahmane@gmail.com',
      to: 'mahdiabd731@gmail.com',
      subject: 'New Client Information Submission',
      text: emailContent,
    };

    log('Attempting to send email with nodemailer...');
    const result = await transporter.sendMail(mailOptions);
    log('Email sent successfully', { messageId: result.messageId });
    return true;
  } catch (error) {
    log('Error sending email:', error);
    throw error;
  }
};

// Main Netlify Function handler
exports.handler = async (event, context) => {
  log('Function invoked', { 
    method: event.httpMethod, 
    path: event.path,
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
    const body = JSON.parse(event.body);
    log('Raw request body received:', body);

    // Basic validation - just check for required field
    if (!body.yearsOfExperience) {
      log('Validation failed: missing yearsOfExperience');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Years of experience is required' })
      };
    }

    // Send email with form data - always send regardless of image upload status
    let emailError = null;
    try {
      log('Attempting to send email...');
      await sendFormEmail(body);
      log('Email function completed successfully');
    } catch (error) {
      emailError = error;
      log('Email sending failed:', error);
    }

    // Return response with email status
    const response = {
      success: true,
      id: Math.random().toString(36).substr(2, 9),
      message: emailError ? 'Form submitted but email failed to send' : 'Form submitted and email sent successfully',
      emailSent: !emailError
    };

    log('Returning response:', response);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    log('Function error:', error);
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