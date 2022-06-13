import mongoose from 'mongoose';
import connection from '../services/db.js';

const ActivitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  user_address: {
    type: String,
    required: true
  },
  activity_type: {
    type: String,
    enum: [
      'follow',
      'unfollow',
      'favourite',
      'review',
    ],
    required: true
  },
  date: {
    type: mongoose.SchemaTypes.Date,
    required: true,
    default: Date.now()
  },
  target_user_address: {
    type: String
  },
  target_user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  target_project_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project',
  },
  target_project_slug: {
    type: String
  },
  target_project_name: {
    type: String
  },
  imageURL: {
    type: String
  },
});

export default connection.model('Activity', ActivitySchema);