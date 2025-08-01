import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

activitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;