import Activity from '../models/activity.model.js';
import Member from '../models/database.model.js';

export async function getActivities(req, res, next) {
  try {
    const activities = await Activity.find().populate('participants', 'nama nim');
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
}

export async function createActivity(req, res, next) {
  try {
    const activityData = req.body;
    const newActivity = new Activity(activityData);
    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const { id } = req.params;
    const activityData = req.body;
    const updatedActivity = await Activity.findByIdAndUpdate(id, activityData, { new: true });
    if (!updatedActivity) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    res.status(200).json(updatedActivity);
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    if (!deletedActivity) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    res.status(200).json({ message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

export async function addParticipant(req, res, next) {
  try {
    const { activityId, memberId } = req.params;
    
    const activity = await Activity.findById(activityId);
    const member = await Member.findById(memberId);
    
    if (!activity || !member) {
      return res.status(404).json({ message: 'Kegiatan atau anggota tidak ditemukan' });
    }
    
    if (activity.participants.includes(memberId)) {
      return res.status(400).json({ message: 'Anggota sudah terdaftar dalam kegiatan ini' });
    }
    
    activity.participants.push(memberId);
    await activity.save();
    
    res.status(200).json(activity);
  } catch (err) {
    next(err);
  }
}