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

export async function importMembers(req, res, next) {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Data tidak valid' });
    }

    const results = {
      success: 0,
      errors: []
    };
    
    for (const memberData of data) {
      try {
        const existingMember = await Member.findOne({ nim: memberData.nim });
        if (existingMember) {
          results.errors.push({
            nim: memberData.nim,
            nama: memberData.nama,
            error: 'NIM sudah terdaftar'
          });
          continue;
        }

         const member = new Member(memberData);
        await member.save();
        results.success++;
      } catch (err) {
        // Handle duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
          results.errors.push({
            nim: memberData.nim,
            nama: memberData.nama,
            error: 'NIM sudah terdaftar'
          });
        } else {
          results.errors.push({
            nim: memberData.nim,
            nama: memberData.nama,
            error: err.message
          });
        }
      }
    }

    res.status(200).json({
      message: `Import selesai. Berhasil: ${results.success}, Gagal: ${results.errors.length}`,
      details: results
    });
  } catch (err) {
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