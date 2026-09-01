const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const env = require('../config/env');

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    username: user.username,
    email: user.email,
  };
}

async function registerUser({ fullName, username, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      const error = new Error('This email is already registered.');
      error.status = 409;
      throw error;
    }

    const error = new Error('This username is already in use.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
  });

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  return sanitizeUser(user);
}

async function updateUserProfile(userId, { fullName, email }) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  const normalizedEmail = email?.trim().toLowerCase();

  if (normalizedEmail && normalizedEmail !== user.email) {
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      const error = new Error('This email is already registered.');
      error.status = 409;
      throw error;
    }

    user.email = normalizedEmail;
  }

  if (fullName?.trim()) {
    user.fullName = fullName.trim();
  }

  await user.save();

  return sanitizeUser(user);
}


async function changeUserPassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  if (!currentPassword || !newPassword) {
    const error = new Error(
      'Current password and new password are required.'
    );
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error(
      'New password must contain at least 8 characters.'
    );
    error.status = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error(
      'New password must be different from your current password.'
    );
    error.status = 400;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error('Current password is incorrect.');
    error.status = 401;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);

  await user.save();

  return {
    message: 'Password changed successfully.',
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  changeUserPassword,
};