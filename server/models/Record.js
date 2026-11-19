import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 120 
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: 2000, 
    default: '' 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 80 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Record', recordSchema);
