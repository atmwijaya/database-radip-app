import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    user_id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to handle user_id increment
adminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastUser = await User.findOne().sort({ user_id: -1 });
    this.user_id = lastUser ? lastUser.user_id + 1 : 1;
  }
  this.updated_at = Date.now();
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;