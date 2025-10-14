// controllers/applicationController.js
import { sendEmailNotification } from '../utils/email.js';
import Application from '../models/Application.js';

export const updateApplicationStatus = async (req, res) => {
  try {
    console.log('▶️ Entering updateApplicationStatus');
    const userId = req.user.id;
    const { status, notes } = req.body; // Extract notes from req.body
    const { id } = req.params;

    if (!['Pending', 'Accepted', 'Rejected', 'Interview Scheduled'].includes(status)) {
      console.log('❌ Invalid status value');
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(id).populate('jobId').populate('applicantId');
    if (!application) {
      console.log('❌ No application found');
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.jobId.postedBy.toString() !== userId) {
      console.log('❌ Unauthorized attempt');
      return res.status(403).json({ message: 'You are not authorized' });
    }

    // Save status and feedback
    application.status = status;
    if (notes) application.feedback = notes; // Save notes as feedback if provided

    await application.save();
    console.log(`✅ Status updated to ${status}, Feedback: ${notes || 'None'}`);

    // Email notification
    const email = application.applicantId.email;
    const jobTitle = application.jobId.title;
    const feedbackText = notes ? `<p>Feedback: ${notes}</p>` : '';

    console.log(`📧 Attempting to send email to ${email} for job ${jobTitle}`);
    await sendEmailNotification({
      to: email,
      subject: `Your Application Status for ${jobTitle}`,
      html: `
        <h2>Application Status Update</h2>
        <p>Hi ${application.applicantId.username || 'Applicant'},</p>
        <p>Your application status has been updated to: ${status}.</p>
        ${feedbackText} <!-- Include feedback in email if provided -->
        <p>Thank you for using AbleConnect Job Portal!</p>
      `,
    });

    res.json({ message: 'Status updated and email sent' });
  } catch (error) {
    console.error('❌ Error in status update route:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
};