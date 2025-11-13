import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { userService } from '../services/UserService.js';
import { cartsService } from '../services/CartService.js';
import { config } from './config.js';

const cookieExtractor = (req) => req?.cookies?.jwt || null;

export function initializePassport() {
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age, role } = req.body;
          if (!first_name || !last_name || !email || !password)
            return done(null, false, { message: 'Campos incompletos' });

          const exists = await userService.getByEmail(email.toLowerCase());
          if (exists)
            return done(null, false, { message: 'Email ya registrado' });

          const cart = await cartsService.create();
          const hashed = await userService.hashPassword(password);

          const newUser = await userService.createUser({
            first_name,
            last_name,
            email: email.toLowerCase(),
            age,
            password: hashed,
            cart: cart._id,
            role: role || 'user',
          });

          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const user = await userService.getByEmail(email.toLowerCase());
          if (!user)
            return done(null, false, { message: 'Usuario no encontrado' });

          const valid = await userService.validatePassword(user, password);
          if (!valid)
            return done(null, false, { message: 'Contraseña inválida' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    'jwt',
    new JwtStrategy(
      { jwtFromRequest: cookieExtractor, secretOrKey: config.SECRET },
      async (jwt_payload, done) => {
        try {
          const user = await userService.getById(jwt_payload.sub);
          if (!user)
            return done(null, false, { message: 'Token o usuario inválido' });
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}
