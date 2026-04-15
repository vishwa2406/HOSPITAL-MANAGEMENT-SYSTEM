/**
 * Standardized Email Templates for LIOHNS Life Care
 */

const hospitalName = "LIOHNS Life Care";
const primaryColor = "#0d9488"; // Teal
const secondaryColor = "#0f766e"; // Darker Teal
const bgLight = "#f4f7f6";
const cardBg = "#ffffff";
const textColor = "#1e293b";
const mutedColor = "#64748b";
const borderRadius = "12px";

/**
 * Base template wrapper for all emails
 */
const baseTemplate = (title, content) => `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: ${bgLight}; color: ${textColor}; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: ${cardBg}; border-radius: ${borderRadius}; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%); padding: 30px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">${hospitalName}</h1>
      </div>
      
      <!-- BODY -->
      <div style="padding: 40px;">
        <h2 style="color: ${primaryColor}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">${title}</h2>
        ${content}
      </div>
      
      <!-- FOOTER -->
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: ${mutedColor};">Thank you for choosing ${hospitalName}</p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} ${hospitalName}. All rights reserved.<br>
          This is an automated message, please do not reply directly.
        </p>
      </div>
    </div>
  </div>
`;

/**
 * Styled box for highlighting important info (like Appointment ID)
 */
const highlightBox = (label, value) => `
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
    <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: ${mutedColor}; font-weight: 700;">${label}</p>
    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; color: ${primaryColor}; letter-spacing: 1px;">
      ${value}
    </p>
  </div>
`;

/**
 * Welcome Email for New Doctors
 */
export const getAddDoctorEmail = (doctorName, email, password) => {
  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>Dr. ${doctorName}</strong>,</p>
    <p>Welcome to the ${hospitalName} medical team. Your professional profile has been successfully created in our system.</p>
    
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: ${textColor};">Your Login Credentials:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 5px 0; color: ${mutedColor}; width: 80px;">Email:</td>
          <td style="padding: 5px 0; font-family: monospace; font-weight: bold;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: ${mutedColor};">Password:</td>
          <td style="padding: 5px 0; font-family: monospace; font-weight: bold;">${password || 'Your existing password'}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #d97706;">
      <p style="margin: 0; color: #92400e; font-size: 13px;">
        <strong>Security Notice:</strong> You will be prompted to change your temporary password upon your first login for security purposes.
      </p>
    </div>
    
    <p style="font-size: 14px; color: ${mutedColor}; margin-top: 30px;">
      You can now log in to the doctor portal to manage your schedule and view patient appointments.
    </p>
  `;
  return baseTemplate("Welcome to LIOHNS Life Care", content);
};

/**
 * Contact Form Inquiry Email
 */
export const getContactFormEmail = (name, email, subject, message) => {
  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hello,</p>
    <p>A new inquiry has been received through the website contact form. Details are provided below:</p>
    
    <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0; width: 100px;">Name</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0;">Email</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">
            <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0;">Subject</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${subject}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 15px; font-weight: 600; color: ${textColor}; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">Message</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 20px 15px; line-height: 1.6; font-style: italic; color: #475569;">
            "${message.replace(/\n/g, '<br>')}"
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="mailto:${email}" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reply to Patient</a>
    </div>
  `;
  return baseTemplate("New Inquiry Received", content);
};

/**
 * New Appointment Booked (Sent to Doctor)
 */
export const getNewAppointmentBookedEmail = (doctorName, patientName, date, time, appointmentId) => {
  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}</strong>,</p>
    <p>A new appointment has been scheduled with you. Please see the details below:</p>
    
    <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0; width: 120px;">Patient</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${patientName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0;">Date</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${date}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor};">Time</td>
          <td style="padding: 12px 15px;">${time}</td>
        </tr>
      </table>
    </div>
    
    ${highlightBox("Appointment ID", appointmentId)}
    
    <p style="font-size: 14px; color: ${mutedColor}; margin-top: 30px; text-align: center;">
      Please log in to your dashboard to review or manage this appointment.
    </p>
  `;
  return baseTemplate("New Appointment Booked", content);
};

/**
 * Request Received (Sent to Patient)
 */
export const getRequestReceivedEmail = (patientName, doctorName, date, time) => {
  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${patientName}</strong>,</p>
    <p>Thank you for choosing ${hospitalName}. We have received your appointment request with <strong>Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}</strong>.</p>
    
    <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #f8fafc;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Requested Schedule:</strong><br>
        Date: ${date}<br>
        Time: ${time}
      </p>
    </div>
    
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <span style="font-weight: 700; color: #d97706; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Status: Pending Approval</span>
    </div>
    
    <p style="font-size: 14px; color: ${mutedColor}; margin-top: 30px;">
      Our team and the doctor will review your request shortly. You will receive another notification once it has been confirmed.
    </p>
  `;
  return baseTemplate("Request Received", content);
};

/**
 * Appointment Status Update (Approved, Completed, etc.)
 */
export const getAppointmentStatusEmail = (title, patientName, doctorName, date, time, appointmentId, status) => {
  let statusColor = primaryColor;
  let statusBg = "#ccfbf1";
  let statusBorder = "#5eead4";
  
  if (status === 'rejected' || status === 'cancelled') {
    statusColor = "#e11d48"; // Rose/Red
    statusBg = "#ffe4e6";
    statusBorder = "#fecdd3";
  } else if (status === 'completed') {
    statusColor = "#0369a1"; // Blue
    statusBg = "#e0f2fe";
    statusBorder = "#bae6fd";
  }

  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${patientName}</strong>,</p>
    <p>This is an update regarding your appointment with <strong>Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}</strong>.</p>
    
    <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0; width: 120px;">Doctor</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor}; border-bottom: 1px solid #e2e8f0;">Date</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${date}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 15px; font-weight: 600; color: ${textColor};">Time</td>
          <td style="padding: 12px 15px;">${time}</td>
        </tr>
      </table>
    </div>
    
    ${highlightBox("Appointment ID", appointmentId)}
    
    <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 8px; padding: 15px; margin-top: 15px; text-align: center;">
      <span style="font-weight: 700; color: ${statusColor}; text-transform: uppercase; letter-spacing: 1px;">Status: ${status}</span>
    </div>
    
    <p style="font-size: 14px; color: ${mutedColor}; margin-top: 30px; text-align: center;">
      If you have any questions, please contact our hospital administration.<br>
      Thank you for choosing ${hospitalName}!
    </p>
  `;
  return baseTemplate(title, content);
};

/**
 * OTP Email Template
 */
export const getOTPEmail = (otp) => {
  const content = `
    <p style="font-size: 16px; margin-top: 0;">Hello,</p>
    <p>Use the following OTP to reset your password. This OTP is valid for <strong>5 minutes</strong>.</p>
    
    <div style="background-color: #f8fafc; border: 2px dashed ${primaryColor}; border-radius: 8px; padding: 30px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: ${mutedColor}; font-weight: 700;">Your Verification Code</p>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: bold; color: ${primaryColor}; letter-spacing: 12px; margin-left: 12px;">
        ${otp}
      </span>
    </div>
    
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #d97706;">
      <p style="margin: 0; color: #92400e; font-size: 13px;">
        <strong>Security Warning:</strong> If you did not request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;
  return baseTemplate("Password Reset OTP", content);
};
