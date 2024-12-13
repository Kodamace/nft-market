const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();
async function verifyGoogleTokenId(credential) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.username || !user.email)
      return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );
    res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        solanaWallet: user.solanaWallet,
        _id: user._id,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.registerUser = async (req, res) => {
  const { username, password, email, solanaWallet } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      solanaWallet,
      role: 'designer',
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const userCredentials = await verifyGoogleTokenId(credential);
    const userId = userCredentials.sub;
    const foundUser = await User.findOne({
      googleId: userId,
    });
    let token = null;
    let user = null;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userCredentials.sub, salt);
    if (!foundUser) {
      user = new User({
        authType: 'GOOGLE',
        googleId: userId,
        role: 'designer',
        email: userCredentials.email,
        password: hashedPassword,
        solanaWallet: '',
        username: userCredentials.name,
      });
      await user.save();
    } else {
      user = foundUser;
    }
    if (!user) res.status(400).json({ message: 'Error logging in' });
    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );
    res.status(200).send({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
