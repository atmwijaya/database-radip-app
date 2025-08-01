import Member from '../models/database.model.js';

export async function getDatabase(req, res, next) {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
}

export async function createMember(req, res, next) {
  try {
    const memberData = req.body;
    const newMember = new Member(memberData);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    if (err.code === 11000) {
      err.message = 'NIM sudah terdaftar';
    }
    next(err);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const memberData = req.body;
    const updatedMember = await Member.findByIdAndUpdate(id, memberData, { new: true });
    if (!updatedMember) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }
    res.status(200).json(updatedMember);
  } catch (err) {
    next(err);
  }
}

export async function deleteMember(req, res, next) {
  try {
    const { id } = req.params;
    const deletedMember = await Member.findByIdAndDelete(id);
    if (!deletedMember) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' });
    }
    res.status(200).json({ message: 'Anggota berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}