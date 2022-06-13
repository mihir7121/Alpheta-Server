import mongoose from 'mongoose';
import connection from '../services/db.js';

const ProjectSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Undefined'
  },
  description: {
    type: String,
    required: true,
    default: null
  },
  imageURL: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0.0
  },
  vote_count_user: {
    type: Number,
    required: true,
    default: 0
  },
  vote_count_alpha: {
    type: Number,
    required: true,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: false
      },
      score: {
        type: Number,
        required: true
      }
    }
  ]
})

export default connection.model('Project', ProjectSchema)