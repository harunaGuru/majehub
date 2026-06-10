import path from 'path';
import { cwd } from 'process';
import ejs from 'ejs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // service: process.env.SMTP_SERVICE,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const renderEmailTemplate = async (
  templateName: string,
  variables: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    cwd(),
    'apps',
    'order-service',
    'src',
    'utils',
    'email-templates',
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, variables);
};

export const sendMail = async (
  email: string,
  template: string,
  variables: Record<string, any>,
  subject: string
) => {
  try {
    const renderedHtml = await renderEmailTemplate(template, variables);
    console.log('Rendered HTML:', renderedHtml); // Debugging line
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: subject,
      html: renderedHtml,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
