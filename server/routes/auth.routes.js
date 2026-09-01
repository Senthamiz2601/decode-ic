const express = require('express');

const {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  changeUserPassword,
} = require('../services/auth.service');

const requireAuth = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'All fields are required.',
      });
    }

    const result = await registerUser({
      fullName,
      username,
      email,
      password,
    });

    return res.status(201).json({
      ok: true,
      message: 'Account created successfully.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email and password are required.',
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      ok: true,
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.userId);

    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/profile
// ─────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        ok: false,
        message: 'Full name and email are required.',
      });
    }

    const user = await updateUserProfile(req.userId, {
      fullName,
      email,
    });

    return res.status(200).json({
      ok: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
});


// PUT /api/auth/change-password
router.put('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await changeUserPassword(req.userId, {
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      ok: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;