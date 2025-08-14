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

// Build email content function - using the same template as the local server
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

Specific Specialties: ${formData.specialties || 'Not provided'}` : ''}

Services: ${formData.services && formData.services.length > 0 ? `
${formData.services.map((service, index) => `
Service ${index + 1}:
  Name: ${service.name || 'Not provided'}
  Description: ${service.description || 'Not provided'}
  Executing Steps: ${service.steps || 'Not provided'}
  Service Pictures: ${service.pictureUrls && service.pictureUrls.length > 0 ? service.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n    ') : 'No pictures provided'}`).join('\n')}` : 'No services added'}

Previous Projects: ${formData.projects && formData.projects.length > 0 ? `
${formData.projects.map((project, index) => `
Project ${index + 1}:
  Title: ${project.title || 'Not provided'}
  Description: ${project.description || 'Not provided'}
  Before/After Photos: ${project.beforeAfter ? 'Yes' : 'No'}${project.beforeAfter ? `
  Before Pictures: ${project.beforePictureUrls && project.beforePictureUrls.length > 0 ? project.beforePictureUrls.map((url, i) => `Before Picture ${i + 1}: ${url}`).join('\n    ') : 'No before pictures provided'}
  After Pictures: ${project.afterPictureUrls && project.afterPictureUrls.length > 0 ? project.afterPictureUrls.map((url, i) => `After Picture ${i + 1}: ${url}`).join('\n    ') : 'No after pictures provided'}` : `
  Project Pictures: ${project.pictureUrls && project.pictureUrls.length > 0 ? project.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n    ') : 'No pictures provided'}`}
  Client Feedback: ${project.clientFeedback || 'Not provided'}`).join('\n')}` : 'No projects added'}

Service Areas: ${formData.serviceAreas && formData.serviceAreas.length > 0 ? `
${formData.serviceAreas.map((area) => `- ${area.name || 'Not provided'}`).join('\n')}

Additional Descriptions/Notes:
${formData.serviceAreasDescription || 'Not provided'}` : 'No service areas added'}

Financing Options: ${formData.financingOptions && formData.financingOptions.length > 0 ? `
${formData.financingOptions.map((option, index) => `
Plan ${index + 1}:
  Plan Title: ${option.name || 'Not provided'}
  Full Plan Description: ${option.description || 'Not provided'}
  Interest Rate: ${option.interestRate || 'Not provided'}
  Term Length: ${option.termLength || 'Not provided'}
  Minimum Amount: ${option.minimumAmount || 'Not provided'}
  Qualification Requirements: ${option.qualificationRequirements || 'Not provided'}`).join('\n')}` : 'No financing options added'}

Storm Services: ${formData.stormServices && formData.stormServices.length > 0 ? `
${formData.stormServices.map((service, index) => `
Service ${index + 1}:
  Service Name: ${service.serviceName || 'Not provided'}
  Service Description: ${service.serviceDescription || 'Not provided'}
  Response Time: ${service.responseTime || 'Not provided'}
  Insurance Partnership: ${service.insurancePartnership || 'Not provided'}`).join('\n')}` : 'No storm services added'}

Brands You Work With: ${formData.brands && formData.brands.length > 0 ? `
${formData.brands.map((brand, index) => `- ${brand}`).join('\n')}

Additional Notes About Brand Partnerships:
${formData.brandsAdditionalNotes || 'Not provided'}` : 'No brands added'}

Certifications & Awards: ${formData.certifications && formData.certifications.length > 0 ? `
${formData.certifications.map((cert, index) => `- ${cert}`).join('\n')}

Certification Pictures: ${formData.certificationPictureUrls && formData.certificationPictureUrls.length > 0 ? formData.certificationPictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n') : 'No pictures provided'}

Additional Notes About Certifications & Awards:
${formData.certificationsAdditionalNotes || 'Not provided'}` : 'No certifications added'}

Installation Process: ${formData.installationProcessServices && formData.installationProcessServices.length > 0 ? `
${formData.installationProcessServices.map((service, index) => `
Service ${index + 1}: ${service.serviceName || 'Untitled Service'}
Steps:
${service.steps && service.steps.length > 0 ? service.steps.map((step, stepIndex) => `  ${stepIndex + 1}. ${step}`).join('\n') : '  No steps provided'}

Installation Pictures: ${service.pictureUrls && service.pictureUrls.length > 0 ? service.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n') : 'No pictures provided'}

Additional Notes About Installation Process:
${service.additionalNotes || 'Not provided'}`).join('\n\n')}` : 'No installation process services added'}

Roof Maintenance Guide: ${formData.hasMaintenanceGuide ? 'Yes' : 'No'}${formData.hasMaintenanceGuide && formData.maintenanceTips && formData.maintenanceTips.length > 0 ? `
Maintenance Tips:
${formData.maintenanceTips.map((tip, index) => `  ${index + 1}. ${tip}`).join('\n')}` : formData.hasMaintenanceGuide ? '\nNo maintenance tips provided' : ''}

Roof Materials and Brands: ${formData.hasRoofMaterials ? 'Yes' : 'No'}${formData.hasRoofMaterials && formData.roofMaterialsSpecialties ? `
Specific materials and brands you specialize in:
${formData.roofMaterialsSpecialties}` : formData.hasRoofMaterials ? '\nNo specialties provided' : ''}

Warranty Coverage: ${formData.hasWarranty ? 'Yes' : 'No'}${formData.hasWarranty ? `${formData.warrantyDuration ? `
Warranty Duration: ${formData.warrantyDuration}` : ''}${formData.warrantyType ? `
Warranty Type: ${formData.warrantyType}` : ''}${formData.warrantyCoverageDetails ? `
Coverage Details:
${formData.warrantyCoverageDetails}` : ''}${formData.warrantyTerms && formData.warrantyTerms.length > 0 ? `
Warranty Terms and Conditions:
${formData.warrantyTerms.map((term, index) => `  ${index + 1}. ${term}`).join('\n')}` : ''}${formData.warrantyAdditionalNotes ? `
Additional Notes/Description:
${formData.warrantyAdditionalNotes}` : ''}` : ''}

Insurance Coverage: ${formData.hasInsurance ? 'Yes' : 'No'}${formData.hasInsurance ? `${formData.generalLiability ? `
General Liability Amount: ${formData.generalLiability}` : ''}${formData.bondedAmount ? `
Bonded Amount: ${formData.bondedAmount}` : ''}
Workers' Compensation Insurance: ${formData.workersCompensation !== undefined && formData.workersCompensation !== null ? (formData.workersCompensation ? 'Yes' : 'No') : 'Not provided'}${formData.additionalCoverage ? `
Additional Coverage: ${formData.additionalCoverage}` : ''}` : ''}

Notes/Additional Features: ${formData.hasAdditionalNotes ? 'Yes' : 'No'}${formData.hasAdditionalNotes && formData.additionalNotes ? `
${formData.additionalNotes}` : ''}

---
This email was sent automatically from the client information form.`;
};

// Email sending function
const sendFormEmail = async (formData) => {
  const createTransporter = () => {
    return nodemailer.createTransport({
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
    
    // Debug the form data being sent to email builder
    log('FormData services for email:', JSON.stringify(formData.services, null, 2));
    log('FormData projects for email:', JSON.stringify(formData.projects, null, 2));
    log('FormData certificationPictureUrls for email:', formData.certificationPictureUrls);
    
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
    
    // Debug: Check specifically for image URLs in the data
    log('Services data received:', body.services);
    log('Projects data received:', body.projects);
    log('Certification pictures:', body.certificationPictureUrls);
    log('Installation process services:', body.installationProcessServices);

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