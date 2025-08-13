const nodemailer = require('nodemailer');

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
    const transporter = createTransporter();
    
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
  Service Pictures: ${service.pictureUrls && service.pictureUrls.length > 0 ? service.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n    ') : 'No pictures provided'}`).join('\n')}` : 'No services added'}

Previous Projects: ${formData.projects && formData.projects.length > 0 ? `
${formData.projects.map((project, index) => `
Project ${index + 1}:
  Title: ${project.title || 'Not provided'}
  Description: ${project.description || 'Not provided'}
  Before/After Photos: ${project.beforeAfter ? 'Yes' : 'No'}${project.beforeAfter ? `
  Before Pictures: ${project.beforePictureUrls && project.beforePictureUrls.length > 0 ? project.beforePictureUrls.map((url, i) => `Before Picture ${i + 1}: ${url}`).join('\n    ') : 'No before pictures provided'}
  After Pictures: ${project.afterPictureUrls && project.afterPictureUrls.length > 0 ? project.afterPictureUrls.map((url, i) => `After Picture ${i + 1}: ${url}`).join('\n    ') : 'No after pictures provided'}` : ''}${!project.beforeAfter && project.pictureUrls && project.pictureUrls.length > 0 ? `
  Project Pictures: ${project.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n    ')}` : ''}
  Client Feedback: ${project.clientFeedback || 'Not provided'}`).join('\n')}` : 'No projects added'}

Service Areas: ${formData.serviceAreas && formData.serviceAreas.length > 0 ? `
${formData.serviceAreas.map((area) => `- ${area.name || area.description || 'Not provided'}`).join('\n')}${formData.serviceAreasDescription ? `
Additional Descriptions/Notes:
${formData.serviceAreasDescription}` : ''}` : 'No service areas added'}

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
${formData.brands.map((brand) => `- ${brand}`).join('\n')}${formData.brandsNotes ? `
Additional Notes About Brand Partnerships:
${formData.brandsNotes}` : ''}` : 'No brands added'}

Certifications & Awards: ${formData.certifications && formData.certifications.length > 0 ? `
${formData.certifications.map((cert) => `- ${cert}`).join('\n')}` : 'No certifications added'}${formData.certificationPictureUrls && formData.certificationPictureUrls.length > 0 ? `
Certification Pictures: ${formData.certificationPictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n')}` : ''}${formData.certificationsNotes ? `
Additional Notes About Certifications & Awards:
${formData.certificationsNotes}` : ''}

Installation Process: ${formData.installationProcessServices && formData.installationProcessServices.length > 0 ? `
${formData.installationProcessServices.map((service, index) => `
Service ${index + 1}: ${service.serviceName || 'Not provided'}
Steps:
${service.steps ? service.steps.split('\n').map((step, i) => `  ${i + 1}. ${step.trim()}`).join('\n') : '  Not provided'}${service.pictureUrls && service.pictureUrls.length > 0 ? `
Installation Pictures: ${service.pictureUrls.map((url, i) => `Picture ${i + 1}: ${url}`).join('\n')}` : ''}`).join('\n')}${formData.installationProcessNotes ? `
Additional Notes About Installation Process:
${formData.installationProcessNotes}` : ''}` : 'No installation process services added'}

Roof Maintenance Guide: ${formData.hasMaintenanceGuide ? 'Yes' : 'No'}${formData.hasMaintenanceGuide && formData.maintenanceTips && formData.maintenanceTips.length > 0 ? `
Maintenance Tips:
${formData.maintenanceTips.map((tip, i) => `  ${i + 1}. ${tip}`).join('\n')}` : ''}

Roof Materials and Brands: ${formData.hasRoofMaterials ? 'Yes' : 'No'}${formData.hasRoofMaterials ? `
Specific materials and brands you specialize in:
${formData.roofMaterialsDetails || 'Not provided'}${formData.roofMaterialsSpecialties ? `
Additional Specialties:
${formData.roofMaterialsSpecialties}` : ''}` : ''}

Warranty Coverage: ${formData.hasWarranty ? 'Yes' : 'No'}${formData.hasWarranty ? `
Warranty Duration: ${formData.warrantyDuration || 'Not provided'}
Warranty Type: ${formData.warrantyType || 'Not provided'}${formData.warrantyTerms && formData.warrantyTerms.length > 0 ? `
Warranty Terms and Conditions:
${formData.warrantyTerms.map((term, i) => `  ${i + 1}. ${term}`).join('\n')}` : ''}${formData.warrantyDescription ? `
Additional Notes/Description:
${formData.warrantyDescription}` : ''}` : ''}

Insurance Coverage: ${formData.hasInsurance ? 'Yes' : 'No'}${formData.hasInsurance ? `
General Liability Amount: ${formData.generalLiability || 'Not provided'}${formData.bondedAmount ? `
Bonded Amount: ${formData.bondedAmount}` : ''}
Workers' Compensation Insurance: ${formData.workersCompensation ? 'Yes' : 'No'}${formData.additionalCoverage ? `
Additional Coverage: ${formData.additionalCoverage}` : ''}` : ''}

Notes/Additional Features: ${formData.hasAdditionalNotes ? 'Yes' : 'No'}${formData.hasAdditionalNotes && formData.additionalNotes ? `
${formData.additionalNotes}` : ''}

---
This email was sent automatically from the client information form.`;

    console.log('Email content being sent:', emailContent);

    const mailOptions = {
      from: 'chouikimahdiabderrahmane@gmail.com',
      to: 'mahdiabd731@gmail.com',
      subject: 'New Client Information Submission',
      text: emailContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Main Netlify Function handler
exports.handler = async (event, context) => {
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
    console.log('Raw request body received:', JSON.stringify(body, null, 2));

    // Basic validation - just check for required field
    if (!body.yearsOfExperience) {
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
    try {
      await sendFormEmail(body);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue with success response even if email fails
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        id: Math.random().toString(36).substr(2, 9),
        message: 'Form submitted successfully'
      })
    };

  } catch (error) {
    console.error('Error processing submission:', error);
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