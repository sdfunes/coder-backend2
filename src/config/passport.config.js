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
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          if (!email || !password) {
            return done(null, false, { message: 'Credenciales incompletas' });
          }

          const user = await userManager.getByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }

          const valid = await userManager.validatePassword(user, password);
          if (!valid) {
            return done(null, false, { message: 'Contraseña inválida' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET,
    passReqToCallback: true,
    ignoreExpiration: false,
  };

  passport.use(
    'jwt',
    new JwtStrategy(jwtOptions, async (req, jwt_payload, done) => {
      try {
        if (!jwt_payload?.sub) {
          return done(null, false, { message: 'Token malformado' });
        }

        const user = await userManager.getById(jwt_payload.sub);
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const tokenExp = jwt_payload.exp * 1000;
        if (Date.now() > tokenExp) {
          return done(null, false, { message: 'Token expirado' });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
