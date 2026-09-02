const { db } = require('../config/firebase');

const col = 'books';

class BookModel {
  static async createBook(data) {
    const ref = db.collection(col).doc();
    const id = ref.id;
    const now = new Date().toISOString();
    const qty = parseInt(data.quantity, 10) || 1;

    const bk = {
      bookId: id,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      category: data.category || 'General',
      status: qty > 0 ? 'available' : 'borrowed',
      quantity: qty,
      createdAt: now
    };

    await ref.set(bk);
    return bk;
  }

  static async findById(id) {
    const doc = await db.collection(col).doc(id).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  static async getAllBooks(f = {}) {
    const snap = await db.collection(col).get();
    let res = [];
    snap.forEach(d => { if (d.data()) res.push(d.data()); });

    if (f.category) res = res.filter(b => b.category.toLowerCase() === f.category.toLowerCase());
    if (f.status) res = res.filter(b => b.status.toLowerCase() === f.status.toLowerCase());
    if (f.author) res = res.filter(b => b.author.toLowerCase().includes(f.author.toLowerCase()));

    return res;
  }

  static async searchBooks(str) {
    const snap = await db.collection(col).get();
    const res = [];
    const q = str.toLowerCase();

    snap.forEach(d => {
      const b = d.data();
      if (b && (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))) {
        res.push(b);
      }
    });

    return res;
  }

  static async updateBook(id, data) {
    const ref = db.collection(col).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const curr = doc.data();
    const qty = data.quantity !== undefined ? parseInt(data.quantity, 10) : curr.quantity;
    let st = data.status || curr.status;
    if (data.quantity !== undefined) st = qty > 0 ? 'available' : 'borrowed';

    const payload = { ...data, quantity: qty, status: st };
    await ref.update(payload);
    const updated = await ref.get();
    return updated.data();
  }

  static async deleteBook(id) {
    const ref = db.collection(col).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  }
}

module.exports = BookModel;

