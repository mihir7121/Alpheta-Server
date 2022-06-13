import mongoose from 'mongoose';
import connection from '../services/db.js';

const FeedbackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  user_address: {
    type: String,
  },
  email: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
  feedback: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
  date: {
    type: mongoose.SchemaTypes.Date,
    required: true,
    default: Date.now()
  },
});

export default connection.model('Feedback', FeedbackSchema);