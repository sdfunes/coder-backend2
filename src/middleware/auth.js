export function authorization(requiredRole) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    if (requiredRole === 'user') {
      return next();
    }

    if (user.role !== requiredRole) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

export function ensureOwnsCartOrAdmin() {
  return (req, res, next) => {
    const user = req.user;
    const cid = req.params.cid;
    if (user.role === 'admin') return next();
    if (user.cart && user.cart.toString() === cid) return next();
    return res.status(403).json({ error: 'Solo el propietario puede acceder' });
  };
}

export default { authorization, ensureOwnsCartOrAdmin };
