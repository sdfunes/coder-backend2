import {
  generateResetToken,
  isValidPassword,
  verifyResetToken,
} from '../utils.js';
import { UserService } from '../services/UserService.js';
import { MailService } from '../services/MailerService.js';

const userService = new UserService();
const mailService = new MailService();

export class SessionsController {
  // ✅ Enviar mail de recuperación
  async sendPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const user = await userService.getByEmail(email);

      if (!user)
        return res
          .status(404)
          .json({ status: 'error', message: 'Usuario no encontrado' });

      const token = generateResetToken(email);
      //await mailService.sendPasswordReset(email, token);

      res.json({
        status: 'success',
        message: 'Correo de recuperación enviado',
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // ✅ Resetear contraseña
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const payload = verifyResetToken(token);

      if (!payload)
        return res
          .status(400)
          .json({ status: 'error', message: 'Token inválido o expirado' });

      const user = await userService.getByEmail(payload.email);
      if (!user)
        return res
          .status(404)
          .json({ status: 'error', message: 'Usuario no encontrado' });

      // Evitar misma contraseña anterior
      if (isValidPassword(user, newPassword)) {
        return res.status(400).json({
          status: 'error',
          message: 'La nueva contraseña no puede ser igual a la anterior',
        });
      }

      await userService.updatePassword(payload.email, newPassword);

      res.json({
        status: 'success',
        message: 'Contraseña restablecida correctamente',
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
export default new SessionsController();
