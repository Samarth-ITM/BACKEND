const { db } = require('../config/firebase');

const col = 'transactions';

class TransactionModel {
  static async createTransaction(data) {
    const ref = db.collection(col).doc();
    const id = ref.id;
    const now = new Date();
    const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const tx = {
      transactionId: id,
      userId: data.userId,
      bookId: data.bookId,
      type: 'borrow',
      borrowDate: now.toISOString(),
      returnDate: null,
      dueDate: due.toISOString(),
      status: 'active'
    };

    await ref.set(tx);
    return tx;
  }

  static async findActiveBorrow(uId, bId) {
    const snap = await db.collection(col)
      .where('userId', '==', uId)
      .where('bookId', '==', bId)
      .where('status', '==', 'active')
      .get();

    if (snap.empty) return null;
    return snap.docs[0].data();
  }

  static async markAsReturned(txId) {
    const ref = db.collection(col).doc(txId);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const payload = {
      type: 'return',
      returnDate: new Date().toISOString(),
      status: 'returned'
    };

    await ref.update(payload);
    const res = await ref.get();
    return res.data();
  }

  static async getAllTransactions() {
    const snap = await db.collection(col).get();
    const res = [];
    snap.forEach(d => { if (d.data()) res.push(d.data()); });
    return res;
  }

  static async getTransactionsByUserId(uId) {
    const snap = await db.collection(col).where('userId', '==', uId).get();
    const res = [];
    snap.forEach(d => { if (d.data()) res.push(d.data()); });
    return res;
  }
}

module.exports = TransactionModel;

