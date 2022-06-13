import mongoose from 'mongoose';
import connection from '../services/db.js';

const UserSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  nonce: {
    type: String
  },
  isAlpha: {
    type: Boolean,
    required: true,
    default: false
  },
  review_count: {
    type: Number,
    default: 0,
    required: true
  },
  followers: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }],
  favourites: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project'
  }],
});

export default connection.model('User', UserSchema);