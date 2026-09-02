const { db } = require('../config/firebase');

const col = 'users';

class UserModel {
  static async createUser(data) {
    const ref = db.collection(col).doc();
    const id = ref.id;
    const now = new Date().toISOString();

    const usr = {
      userId: id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'student',
      createdAt: now,
      updatedAt: now
    };

    await ref.set(usr);
    return usr;
  }

  static async findByEmail(email) {
    const snap = await db.collection(col).where('email', '==', email.toLowerCase()).get();
    if (snap.empty) return null;
    return snap.docs[0].data();
  }

  static async findById(id) {
    const doc = await db.collection(col).doc(id).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  static async getAllUsers() {
    const snap = await db.collection(col).get();
    const list = [];
    snap.forEach(d => {
      const u = d.data();
      if (u) {
        const { password, ...safe } = u;
        list.push(safe);
      }
    });
    return list;
  }

  static async updateUser(id, data) {
    const ref = db.collection(col).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const payload = { ...data, updatedAt: new Date().toISOString() };
    await ref.update(payload);
    const res = await ref.get();
    return res.data();
  }

  static async deleteUser(id) {
    const ref = db.collection(col).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  }
}

module.exports = UserModel;

