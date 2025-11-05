import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

export const generaHash = (password) => {
  return bcrypt.hashSync(password, 10);
};
export const validaHash = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export function generateSecureToken(len = 48) {
  return crypto.randomBytes(len).toString('hex');
}

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASS },
});

export async function sendResetPasswordEmail(to, resetUrl) {
  const html = `
    <p>Has solicitado restablecer tu contraseña. Haz clic en el botón:</p>
    <a href="${resetUrl}" style="background:#1a73e8;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;">Restablecer contraseña</a>
    <p>El enlace expirará en 1 hora.</p>
  `;
  return transporter.sendMail({
    from: `"No Reply" <${config.EMAIL_USER}>`,
    to,
    subject: 'Restablecer contraseña',
    html,
  });
}
