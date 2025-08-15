const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      bio,
      location,
      website,
      profilePicture,
      socialLinks,
      preferences
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      req.user.email = email;
    }

    // Update other fields if provided
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    if (location !== undefined) req.user.location = location;
    if (website !== undefined) req.user.website = website;
    if (profilePicture !== undefined) req.user.profilePicture = profilePicture;
    if (socialLinks) req.user.socialLinks = { ...req.user.socialLinks, ...socialLinks };
    if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };

    await req.user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error changing password', error: error.message });
  }
});

// Update email
router.put('/change-email', auth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: 'Please provide both new email and current password' });
    }

    // Verify password
    const isMatch = await req.user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Update email
    req.user.email = newEmail;
    await req.user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error changing email', error: error.message });
  }
});

// Update notification preferences
router.put('/notifications', auth, async (req, res) => {
  try {
    const { emailNotifications } = req.body;

    if (typeof emailNotifications !== 'boolean') {
      return res.status(400).json({ message: 'Invalid notification preference' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.emailNotifications': emailNotifications },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating notification preferences', error: error.message });
  }
});

// Update theme preference
router.put('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;

    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme preference' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.theme': theme },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating theme preference', error: error.message });
  }
});

module.exports = router; 