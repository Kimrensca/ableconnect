import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility function to send email
export const sendEmailNotification = async ({ to, subject, text, html }) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text || html}`);

    const mailOptions = {
      from: `"AbleConnect Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      ...(html ? { html } : { text }),
      // text: text || undefined, // Use text if provided, otherwise undefined
      
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};
