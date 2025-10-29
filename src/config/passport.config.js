import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UserManager from '../dao/managers/UserManager.js';
import CartManager from '../dao/managers/CartManager.js';
import { config } from './config.js';

const userManager = new UserManager();
const cartManager = new CartManager();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

export function initializePassport() {
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;
          if (!first_name || !last_name || !email || !password)
            return done(null, false, { message: 'Campos incompletos' });

          const exists = await userManager.getByEmail(email);
          if (exists)
            return done(null, false, { message: 'Email ya registrado' });

          const cart = await cartManager.createCart();
          const hashed = bcrypt.hashSync(password, 10);

          const newUser = await userManager.createUser({
            first_name,
            last_name,
            email,
            age,
            password: hashed,
            cart: cart._id,
            role: 'user',
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

  passport.use(
    'jwt',
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: config.SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await userManager.getById(jwt_payload.sub);
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
