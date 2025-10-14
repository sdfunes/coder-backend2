import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UserManager from '../dao/managers/UserManager.js';
import { config } from './config.js';

const userManager = new UserManager();

export function initializePassport() {
  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await userManager.getByEmail(email);
          if (!user)
            return done(null, false, { message: 'Usuario no encontrado' });

          const valid = await userManager.validatePassword(user, password);
          if (!valid)
            return done(null, false, { message: 'Contraseña inválida' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET,
  };

  passport.use(
    'jwt',
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await userManager.getById(jwt_payload.sub);
        if (!user) return done(null, false, { message: 'Token inválido' });
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
