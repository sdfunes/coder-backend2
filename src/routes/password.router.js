import { Router } from 'express';
import UserRepository from '../dao/repositories/UserRepository.js';
import PasswordToken from '../dao/models/passwordsToken.js';
import { generateSecureToken, sendResetPasswordEmail } from '../utils/utils.js';
import { config } from '../config/config.js';
import bcrypt from 'bcrypt';

const router = Router();
const userRepo = new UserRepository();

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userRepo.getByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const token = generateSecureToken(24);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await PasswordToken.create({
      user: user._id,
      token,
      expiresAt,
      used: false,
    });

    const resetUrl = `${config.APP_BASE_URL}/reset-password?token=${token}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    res.json({
      status: 'success',
      message: 'Email enviado si el usuario existe',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// página frontend (GET) opcional: renderizas formulario que POSTea a /reset
// procesar reset
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenDoc = await PasswordToken.findOne({ token });

    if (!tokenDoc || tokenDoc.used || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const user = await userRepo.findById(tokenDoc.user);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // evitar restablecer a la misma contraseña
    if (bcrypt.compareSync(password, user.password)) {
      return res
        .status(400)
        .json({ error: 'No puedes usar la misma contraseña anterior' });
    }

    // actualizar pass
    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ status: 'success', message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
