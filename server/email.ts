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
  projects?: Array<{
    title?: string;
    description?: string;
    beforeAfter?: boolean;
    beforePictureUrls?: string[];
    afterPictureUrls?: string[];
    pictureUrls?: string[];
    clientFeedback?: string;
  }> | null;
  serviceAreas?: Array<{
    type?: string;
    name?: string;
    description?: string;
  }> | null;
  serviceAreasDescription?: string;
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

---
This email was sent automatically from the client information form.`;
    
    // Also log the email content to verify what's being sent
    console.log('Email content being sent:', emailContent);

    // Create HTML version with clickable links
    const htmlContent = `<html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">New Client Information Submission</h2>
        
        <h3>FORM SUBMISSION DATA:</h3>
        
        <p><strong>Years of Experience:</strong> ${formData.yearsOfExperience || 'Not provided'} ${formData.yearsOfExperience ? 'years' : ''}</p>
        
        <p><strong>Business Email Address:</strong> ${formData.businessEmail || 'Not provided'}</p>
        
        <p><strong>Do you have a license number?:</strong> ${formData.hasLicense !== undefined && formData.hasLicense !== null ? (formData.hasLicense ? 'Yes' : 'No') : 'Not provided'}${formData.hasLicense && formData.licenseNumber ? `<br><strong>License Number:</strong> ${formData.licenseNumber}` : ''}</p>
        
        <p><strong>Office/Business Address:</strong> ${formData.businessAddress || 'Not provided'}</p>
        
        <p><strong>Business Hours:</strong> ${formData.businessHours || 'Not provided'}</p>
        
        <p><strong>Do you offer emergency services?:</strong> ${formData.hasEmergencyServices !== undefined && formData.hasEmergencyServices !== null ? (formData.hasEmergencyServices ? 'Yes' : 'No') : 'Not provided'}${formData.hasEmergencyServices ? `<br><strong>Do you have a specific phone number for emergencies?:</strong> ${formData.hasEmergencyPhone !== undefined && formData.hasEmergencyPhone !== null ? (formData.hasEmergencyPhone ? 'Yes' : 'No') : 'Not provided'}${formData.hasEmergencyPhone && formData.emergencyPhone ? `<br><strong>Emergency Phone Number:</strong> ${formData.emergencyPhone}` : ''}` : ''}</p>
        
        <p><strong>Additional Notes:</strong> ${formData.additionalNotes || 'Not provided'}</p>
        
        <p><strong>About Us Section Customization:</strong> ${formData.enableAboutModifications !== undefined && formData.enableAboutModifications !== null ? (formData.enableAboutModifications ? 'Yes' : 'No') : 'Not provided'}${formData.enableAboutModifications ? `
        
        <br><strong>Company Story/Background:</strong> ${formData.companyStory || 'Not provided'}
        
        <br><strong>What Sets You Apart:</strong> ${formData.uniqueSellingPoints || 'Not provided'}
        
        <br><strong>Specific Specialties:</strong> ${formData.specialties || 'Not provided'}` : ''}</p>
        
        <h3>Services:</h3>
        ${formData.services && formData.services.length > 0 ? 
          formData.services.map((service, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <h4>Service ${index + 1}:</h4>
              <p><strong>Name:</strong> ${service.name || 'Not provided'}</p>
              <p><strong>Description:</strong> ${service.description || 'Not provided'}</p>
              <p><strong>Executing Steps:</strong> ${service.steps || 'Not provided'}</p>
              <p><strong>Service Pictures:</strong></p>
              ${service.pictureUrls && service.pictureUrls.length > 0 ? 
                `<ul>${service.pictureUrls.map((url, i) => `<li><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">Picture ${i + 1} - View Image</a></li>`).join('')}</ul>` : 
                '<p>No pictures provided</p>'
              }
            </div>
          `).join('') : 
          '<p>No services added</p>'
        }
        
        <h3>Previous Projects:</h3>
        ${formData.projects && formData.projects.length > 0 ? 
          formData.projects.map((project, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <h4>Project ${index + 1}:</h4>
              <p><strong>Title:</strong> ${project.title || 'Not provided'}</p>
              <p><strong>Description:</strong> ${project.description || 'Not provided'}</p>
              <p><strong>Before/After Photos:</strong> ${project.beforeAfter ? 'Yes' : 'No'}</p>
              ${project.beforeAfter ? `
                <p><strong>Before Pictures:</strong></p>
                ${project.beforePictureUrls && project.beforePictureUrls.length > 0 ? 
                  `<ul>${project.beforePictureUrls.map((url, i) => `<li><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">Before Picture ${i + 1} - View Image</a></li>`).join('')}</ul>` : 
                  '<p>No before pictures provided</p>'
                }
                <p><strong>After Pictures:</strong></p>
                ${project.afterPictureUrls && project.afterPictureUrls.length > 0 ? 
                  `<ul>${project.afterPictureUrls.map((url, i) => `<li><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">After Picture ${i + 1} - View Image</a></li>`).join('')}</ul>` : 
                  '<p>No after pictures provided</p>'
                }
              ` : `
                <p><strong>Project Pictures:</strong></p>
                ${project.pictureUrls && project.pictureUrls.length > 0 ? 
                  `<ul>${project.pictureUrls.map((url, i) => `<li><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">Picture ${i + 1} - View Image</a></li>`).join('')}</ul>` : 
                  '<p>No pictures provided</p>'
                }
              `}
              <p><strong>Client Feedback:</strong> ${project.clientFeedback || 'Not provided'}</p>
            </div>
          `).join('') : 
          '<p>No projects added</p>'
        }
        
        <h3>Service Areas:</h3>
        ${formData.serviceAreas && formData.serviceAreas.length > 0 ? `
          <div style="padding: 12px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
            <ul style="margin: 0; padding-left: 20px;">
              ${formData.serviceAreas.map((area) => `<li style="margin: 5px 0;">${area.name || 'Not provided'}</li>`).join('')}
            </ul>
          </div>
          
          <h4 style="margin: 20px 0 10px 0; color: #2563eb;">Additional Descriptions/Notes:</h4>
          <p style="margin: 8px 0;">${formData.serviceAreasDescription || 'Not provided'}</p>
        ` : '<p>No service areas added</p>'}
        
        <hr style="margin: 20px 0;">
        <p style="font-style: italic; color: #666;">This email was sent automatically from the client information form.</p>
      </body>
    </html>`;

    const mailOptions = {
      from: 'chouikimahdiabderrahmane@gmail.com',
      to: 'mahdiabd731@gmail.com',
      subject: 'New Client Information Form Submission',
      text: emailContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};