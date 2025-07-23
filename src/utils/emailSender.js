const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Lab Equipment Reservation System',
      html: `
        <h1>Welcome to the Lab Equipment Reservation System</h1>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for registering with our laboratory equipment reservation system.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Browse available equipment</li>
          <li>Make reservations</li>
          <li>Track your equipment usage</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Function to send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.firstName},</p>
        <p>You have requested to reset your password.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Function to send reservation confirmation email
exports.sendReservationConfirmationEmail = async (reservation, user, equipment) => {
  try {
    const startDate = new Date(reservation.startDate).toLocaleDateString();
    const endDate = new Date(reservation.endDate).toLocaleDateString();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reservation Confirmation',
      html: `
        <h1>Reservation Confirmation</h1>
        <p>Hello ${user.firstName},</p>
        <p>Your reservation has been confirmed:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Equipment</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${equipment.name}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Serial Number</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${equipment.serialNumber}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Start Date</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${startDate}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">End Date</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${endDate}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Purpose</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.purpose}</td>
          </tr>
        </table>
        <p>Please make sure to return the equipment by the end date.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Reservation confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
  }
};

// Function to send reservation rejection email
exports.sendReservationRejectionEmail = async (reservation, user, equipment, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reservation Request Rejected',
      html: `
        <h1>Reservation Request Rejected</h1>
        <p>Hello ${user.firstName},</p>
        <p>We regret to inform you that your reservation request has been rejected:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Equipment</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${equipment.name}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Reason</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${reason || 'Not specified'}</td>
          </tr>
        </table>
        <p>If you have any questions, please contact the lab administrator.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Reservation rejection email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending reservation rejection email:', error);
  }
};

// Function to send return reminder email
exports.sendReturnReminderEmail = async (reservation, user, equipment) => {
  try {
    const endDate = new Date(reservation.endDate).toLocaleDateString();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Equipment Return Reminder',
      html: `
        <h1>Equipment Return Reminder</h1>
        <p>Hello ${user.firstName},</p>
        <p>This is a friendly reminder that your reservation for <strong>${equipment.name}</strong> (Serial: ${equipment.serialNumber}) is due to be returned by <strong>${endDate}</strong>.</p>
        <p>Please ensure that you return the equipment on time to avoid any penalties and to allow other users to access it.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Return reminder email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending return reminder email:', error);
  }
};

// Function to send return confirmation email
exports.sendReturnConfirmationEmail = async (reservation, user, equipment) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Equipment Return Confirmation',
      html: `
        <h1>Equipment Return Confirmation</h1>
        <p>Hello ${user.firstName},</p>
        <p>We confirm that you have successfully returned <strong>${equipment.name}</strong> (Serial: ${equipment.serialNumber}).</p>
        <p>Return Date: ${new Date(reservation.returnDate).toLocaleDateString()}</p>
        <p>Condition: ${reservation.returnCondition}</p>
        <p>Thank you for using our reservation system.</p>
        <p>Best regards,<br>Lab Equipment Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Return confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending return confirmation email:', error);
  }
};

module.exports = exports;
