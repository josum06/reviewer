import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name:      { type: String,  required: true },
  email:     { type: String,  required: true, unique: true, lowercase: true },
  password:  { type: String,  default: null },   // null for Google users
  provider:  { type: String,  default: 'credentials' }, // 'google' or 'credentials'
  createdAt: { type: Date,    default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);