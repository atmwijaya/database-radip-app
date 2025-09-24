import Member from "../models/database.model.js";

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
      err.message = "NIM sudah terdaftar";
    }
    next(err);
  }
}

export async function importMembers(req, res, next) {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Data tidak valid" });
    }

    const results = {
      success: 0,
      duplicates: 0,
      errors: [],
    };

    const existingNIMs = new Set();
    const existingMembers = await Member.find({}, "nim");
    existingMembers.forEach((member) => existingNIMs.add(member.nim));

    const importNIMs = new Set();
    const duplicateInImport = new Set();

    for (const memberData of data) {
      try {
        const nim = memberData.nim.toString();
        if (importNIMs.has(nim)) {
          duplicateInImport.add(nim);
          results.duplicates++;
          results.errors.push({
            nim: nim,
            nama: memberData.nama,
            error: "Duplikat dalam file import",
          });
          continue;
        }
        importNIMs.add(nim);

        if (existingNIMs.has(nim)) {
          results.duplicates++;
          results.errors.push({
            nim: nim,
            nama: memberData.nama,
            error: "NIM sudah terdaftar di database",
          });
          continue;
        }

        const member = new Member(memberData);
        await member.save();
        results.success++;
        existingNIMs.add(nim);
      } catch (err) {
        // Handle duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
          results.errors.push({
            nim: memberData.nim,
            nama: memberData.nama,
            error: "NIM sudah terdaftar",
          });
        } else {
          results.errors.push({
            nim: memberData.nim,
            nama: memberData.nama,
            error: err.message,
          });
        }
      }
    }

    let message = `Import selesai. Berhasil: ${results.success}, `;
    if (results.duplicates > 0) {
      message += `Duplikat: ${results.duplicates}, `;
    }
    message += `Gagal: ${results.errors.length - results.duplicates}`;

    res.status(200).json({
      message: `Import selesai. Berhasil: ${results.success}, Gagal: ${results.errors.length}`,
      details: results,
      duplicatesInImport: Array.from(duplicateInImport)
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const memberData = req.body;
    const updatedMember = await Member.findByIdAndUpdate(id, memberData, {
      new: true,
    });
    if (!updatedMember) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
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
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }
    res.status(200).json({ message: "Anggota berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}
