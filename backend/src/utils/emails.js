import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    // 1. Create a "transporter" (the service that will actually send the email)
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define what the email looks like
    const mailOptions = {
        from: 'Your Company <noreply@shopEasie.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    //send the mail
    await transporter.sendMail(mailOptions);
}
