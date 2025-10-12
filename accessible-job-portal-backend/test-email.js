import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"AccessCareers Test" <${process.env.EMAIL_USER}>`,
  to: 'musimbicarren45@gmail.com',
  subject: '🚀 Test Email from AccessCareers',
  text: 'This is a test email to verify that your nodemailer config works!',
}, (error, info) => {
  if (error) {
    return console.error('❌ Test email failed:', error);
  }
  console.log('✅ Test email sent:', info.response);
});
