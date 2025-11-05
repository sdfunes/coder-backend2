import { Router } from 'express';
import PurchaseService from '../services/PurchaseService.js';
import passport from 'passport';
import { ensureOwnsCartOrAdmin } from '../middlewares/auth.js';

const router = Router();
const purchaseService = new PurchaseService();

router.post(
  '/:cid/purchase',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const purchaserId = req.user._id;
      const result = await purchaseService.purchaseCart(cid, purchaserId);
      res.json({ status: 'success', ...result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
