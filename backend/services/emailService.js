const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
dotenv.config();

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.basePath = 'https://api.brevo.com/v3';
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sender = {
  email: process.env.BREVO_SENDER_EMAIL || "noreply@palmcrestent.com",
  name: "Palmcrest ENT"
};
const logoUrl = "https://palmcrestent.com/logo-ent.jpeg";

const baseHtmlTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
        .logo { max-width: 150px; height: auto; border-radius: 8px; }
        .content { padding: 32px; color: #334155; line-height: 1.6; }
        .title { color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 24px; }
        .details-box { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .detail-row { margin-bottom: 12px; }
        .detail-label { font-weight: bold; color: #475569; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUrl}" alt="Palmcrest ENT Logo" class="logo" />
        </div>
        <div class="content">
            <div class="title">${title}</div>
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Palmcrest ENT. All rights reserved.</p>
            <p>Providing Specialized Ear, Nose, and Throat Care.</p>
        </div>
    </div>
</body>
</html>
`;

const directEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .header { padding: 20px 32px; border-bottom: 2px solid #0ea5e9; display: flex; align-items: center; justify-content: space-between; }
        .logo { max-width: 120px; height: auto; }
        .header-title { color: #0ea5e9; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px; color: #1f2937; line-height: 1.6; font-size: 16px; }
        .title { color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .footer { background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; }
        .footer p { margin: 4px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUrl}" alt="Palmcrest ENT Logo" class="logo" />
            <div class="header-title">Patient Message</div>
        </div>
        <div class="content">
            <div class="title">${title}</div>
            ${content}
        </div>
        <div class="footer">
            <p><strong>Palmcrest ENT</strong></p>
            <p>This is a direct message from your care team.</p>
            <p>&copy; ${new Date().getFullYear()} Palmcrest ENT. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Helper to send emails
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
    try {
        if (process.env.NODE_ENV === 'test') return true;

        if (!process.env.BREVO_API_KEY) {
            console.log('Brevo API key missing. Email not sent:', subject);
            return false;
        }

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent successfully to ${toEmail}. Message ID: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.response?.text || error.message);
        return false;
    }
};

const sendWelcomeEmail = async (user) => {
    const subject = `Welcome to Palmcrest ENT, ${user.fullName}!`;
    const title = "Welcome to Palmcrest ENT";
    const content = `
        <p>Dear ${user.fullName},</p>
        <p>Thank you for creating an account with Palmcrest ENT. We are dedicated to providing you with the highest quality of ear, nose, and throat care.</p>
        <p>You can now log in to your portal to manage your appointments, view your medical notes, and stay connected with our specialists.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://palmcrestent.com'}/login" class="button">Go to Login</a>
        </div>
    `;
    const html = baseHtmlTemplate(title, content);
    await sendEmail(user.email, user.fullName, subject, html);
};

const sendBookingCreatedPatient = async (patient, doctor, appointment) => {
    const subject = "Appointment Request Submitted";
    const title = "Appointment Request Received";
    const content = `
        <p>Dear ${patient.fullName},</p>
        <p>Your appointment request has been successfully submitted and is pending approval from the doctor. We will notify you once it is confirmed.</p>
        <div class="details-box">
            <div class="detail-row"><span class="detail-label">Doctor:</span> Dr. ${doctor.fullName} (${doctor.specialization})</div>
            <div class="detail-row"><span class="detail-label">Date:</span> ${new Date(appointment.date).toDateString()}</div>
            <div class="detail-row"><span class="detail-label">Time:</span> ${appointment.timeSlot}</div>
            <div class="detail-row"><span class="detail-label">Reason:</span> ${appointment.title}</div>
        </div>
    `;
    const html = baseHtmlTemplate(title, content);
    await sendEmail(patient.email, patient.fullName, subject, html);
};

const sendBookingCreatedDoctor = async (doctor, patient, appointment) => {
    const subject = "New Appointment Request Pending";
    const title = "New Appointment Request";
    const content = `
        <p>Dear Dr. ${doctor.fullName},</p>
        <p>You have a new appointment request that requires your review.</p>
        <div class="details-box">
            <div class="detail-row"><span class="detail-label">Patient:</span> ${patient.fullName}</div>
            <div class="detail-row"><span class="detail-label">Date:</span> ${new Date(appointment.date).toDateString()}</div>
            <div class="detail-row"><span class="detail-label">Time:</span> ${appointment.timeSlot}</div>
            <div class="detail-row"><span class="detail-label">Reason:</span> ${appointment.title}</div>
        </div>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://palmcrestent.com'}/doctor-dashboard" class="button">Review Request in Portal</a>
        </div>
    `;
    const html = baseHtmlTemplate(title, content);
    await sendEmail(doctor.email, doctor.fullName, subject, html);
};

const sendBookingStatusUpdate = async (patient, doctor, appointment) => {
    const isApproved = appointment.status === 'Approved';
    const isCompleted = appointment.status === 'Completed';
    const subject = isApproved 
        ? "Appointment Confirmed" 
        : isCompleted 
            ? "Thank you for your visit - Palmcrest ENT" 
            : "Appointment Status Updated";
    const title = isApproved 
        ? "Appointment Confirmed" 
        : isCompleted 
            ? "Appointment Completed" 
            : "Appointment Update";
    
    let content = `
        <p>Dear ${patient.fullName},</p>
        <p>The status of your appointment request with Dr. ${doctor.fullName} has been updated to: <strong>${appointment.status}</strong>.</p>
    `;

    if (isApproved) {
        content += `<p>We look forward to seeing you at our clinic.</p>`;
    } else if (isCompleted) {
        const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/review/${appointment._id}`;
        content += `
            <p>Thank you for visiting us today. We hope your experience was excellent! We value your feedback and would love to hear about your experience. Please take a minute to leave a review:</p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${reviewUrl}" class="button" style="background-color: #f59e0b; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Review</a>
            </div>
        `;
    } else {
        content += `<p>Please log in to your portal to reschedule or contact support if you have any questions.</p>`;
    }

    content += `
        <div class="details-box">
            <div class="detail-row"><span class="detail-label">Doctor:</span> Dr. ${doctor.fullName}</div>
            <div class="detail-row"><span class="detail-label">Date:</span> ${new Date(appointment.date).toDateString()}</div>
            <div class="detail-row"><span class="detail-label">Time:</span> ${appointment.timeSlot}</div>
        </div>
    `;
    const html = baseHtmlTemplate(title, content);
    await sendEmail(patient.email, patient.fullName, subject, html);
};

const sendAppointmentReminder = async (patient, doctor, appointment, type) => {
    let subject = "";
    let title = "";
    let message = "";

    if (type === "24hr") {
        subject = "Reminder: Appointment Tomorrow";
        title = "Upcoming Appointment Reminder";
        message = `This is a reminder for your appointment tomorrow with Dr. ${doctor.fullName}.`;
    } else if (type === "5hr") {
        subject = "Reminder: Appointment in 5 Hours";
        title = "Upcoming Appointment Reminder";
        message = `This is a reminder for your appointment later today with Dr. ${doctor.fullName}.`;
    } else if (type === "post4hr") {
        subject = "Thank you for your visit";
        title = "Post-Appointment Follow-up";
        const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/review/${appointment._id}`;
        message = `Thank you for visiting Dr. ${doctor.fullName} today. We hope your experience was excellent.
        <br/><br/>
        We value your feedback and would love to hear about your experience! Please take a minute to leave a review:
        <br/><br/>
        <div style="text-align: center;">
            <a href="${reviewUrl}" class="button" style="background-color: #f59e0b; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Review</a>
        </div>
        <br/>
        If you need further assistance, please contact us or schedule a follow-up through your portal.`;
    }

    const content = `
        <p>Dear ${patient.fullName},</p>
        <p>${message}</p>
        ${type !== "post4hr" ? `
        <div class="details-box">
            <div class="detail-row"><span class="detail-label">Doctor:</span> Dr. ${doctor.fullName}</div>
            <div class="detail-row"><span class="detail-label">Date:</span> ${new Date(appointment.date).toDateString()}</div>
            <div class="detail-row"><span class="detail-label">Time:</span> ${appointment.timeSlot}</div>
        </div>
        ` : ''}
    `;

    const html = baseHtmlTemplate(title, content);
    await sendEmail(patient.email, patient.fullName, subject, html);
};

const sendGeneralEmail = async (patientEmails, subject, htmlContent) => {
    // Brevo has a limit on Bcc or direct To limits in a single SMTP call (usually 99). 
    // For large lists, it's better to loop or use bulk sending.
    // For simplicity, we loop with a delay or send individually.
    console.log(`Sending broadcast email to ${patientEmails.length} patients...`);
    
    let successCount = 0;
    for (const email of patientEmails) {
        const html = baseHtmlTemplate(subject, htmlContent);
        const result = await sendEmail(email, "Patient", subject, html);
        if (result) successCount++;
    }
    return successCount;
};

const sendAdminInviteEmail = async (admin, setupUrl) => {
    const subject = "Admin Invitation - Palmcrest ENT";
    const title = "Welcome to Palmcrest ENT Administration";
    const content = `
        <p>Dear ${admin.fullName},</p>
        <p>You have been invited to join the Palmcrest ENT team as an Administrator.</p>
        <p>Please click the button below to set up your password and access your dashboard. This link is valid for 24 hours.</p>
        <div style="text-align: center;">
            <a href="${setupUrl}" class="button">Set Up My Password</a>
        </div>
        <p>If you have any questions, please contact the system administrator.</p>
    `;
    const html = baseHtmlTemplate(title, content);
    await sendEmail(admin.email, admin.fullName, subject, html);
};

const sendDirectPatientEmail = async (patientEmail, patientName, subject, messageHtml) => {
    // The subject and title can be the same for direct emails
    const html = directEmailTemplate(subject, messageHtml);
    await sendEmail(patientEmail, patientName, subject, html);
};

const sendDoctorScheduleEmail = async (doctor, timeframe, appointments) => {
    const subject = `Your ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}ly Appointment Schedule - Palmcrest ENT`;
    const title = `Appointment Schedule (${timeframe})`;
    
    let content = `<p>Dear Dr. ${doctor.fullName},</p>`;
    
    if (appointments.length === 0) {
        content += `<p>You have no appointments scheduled for this ${timeframe}.</p>`;
    } else {
        content += `<p>Here is your appointment schedule for this ${timeframe}:</p>
        <div class="details-box">`;
        
        appointments.forEach(apt => {
            const dateStr = new Date(apt.date).toDateString();
            content += `<div class="detail-row" style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <span class="detail-label" style="display:block;">${dateStr} | ${apt.timeSlot}</span>
                <strong>Patient:</strong> ${apt.patient ? apt.patient.fullName : 'Unknown'} <br/>
                <strong>Reason:</strong> ${apt.title} <br/>
                <strong>Type:</strong> ${apt.type}
            </div>`;
        });
        
        content += `</div>`;
    }
    
    const html = baseHtmlTemplate(title, content);
    await sendEmail(doctor.email, doctor.fullName, subject, html);
};

module.exports = {
    sendWelcomeEmail,
    sendBookingCreatedPatient,
    sendBookingCreatedDoctor,
    sendBookingStatusUpdate,
    sendAppointmentReminder,
    sendGeneralEmail,
    sendAdminInviteEmail,
    sendDirectPatientEmail,
    sendDoctorScheduleEmail
};
