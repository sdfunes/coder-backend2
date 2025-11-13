import { mailer } from '../config/mailer.js';
import { config } from '../config/config.js';

export class MailService {
  async sendPasswordReset(email, token) {
    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el botón para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
    `;

    await mailer.sendMail({
      from: 'Ecommerce <no-reply@ecommerce.com>',
      to: email,
      subject: 'Recuperación de contraseña',
      html,
    });
  }
}

export default new MailService();
