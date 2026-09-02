const admin = require('firebase-admin');
require('dotenv').config();

class MockDoc {
  constructor(col, id, data = null) {
    this.col = col;
    this.id = id;
    this._d = data;
  }
  async get() {
    const d = this.col.store.get(this.id);
    return { exists: !!d, id: this.id, data: () => (d ? { ...d } : undefined) };
  }
  async set(data, opts = {}) {
    const old = this.col.store.get(this.id) || {};
    const updated = opts.merge ? { ...old, ...data } : { ...data, id: this.id };
    this.col.store.set(this.id, updated);
    return true;
  }
  async update(data) {
    const old = this.col.store.get(this.id);
    if (!old) throw new Error('Not found');
    this.col.store.set(this.id, { ...old, ...data });
    return true;
  }
  async delete() {
    this.col.store.delete(this.id);
    return true;
  }
}

class MockQ {
  constructor(col, filters = []) {
    this.col = col;
    this.filters = filters;
  }
  where(f, op, val) {
    return new MockQ(this.col, [...this.filters, { f, op, val }]);
  }
  async get() {
    let list = Array.from(this.col.store.values());
    for (const flt of this.filters) {
      list = list.filter(item => {
        const v = item[flt.f];
        if (flt.op === '==') return v === flt.val;
        if (flt.op === '!=') return v !== flt.val;
        return true;
      });
    }
    const refs = list.map(d => new MockDoc(this.col, d.id || d.userId || d.bookId || d.transactionId, d));
    return {
      empty: list.length === 0,
      docs: refs.map(r => ({ id: r.id, exists: true, data: () => r._d })),
      forEach: (cb) => refs.forEach(r => cb({ id: r.id, exists: true, data: () => r._d }))
    };
  }
}

class MockCol {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }
  doc(id) {
    const dId = id || 'id_' + Math.random().toString(36).substring(2, 9);
    return new MockDoc(this, dId);
  }
  async add(data) {
    const id = data.id || 'id_' + Math.random().toString(36).substring(2, 9);
    const docData = { ...data, id };
    this.store.set(id, docData);
    return new MockDoc(this, id, docData);
  }
  where(f, op, val) {
    return new MockQ(this).where(f, op, val);
  }
  async get() {
    return new MockQ(this).get();
  }
}

class MockDB {
  constructor() {
    this.cols = new Map();
  }
  collection(name) {
    if (!this.cols.has(name)) this.cols.set(name, new MockCol(name));
    return this.cols.get(name);
  }
}

let db;

const init = () => {
  const pk = process.env.FIREBASE_PRIVATE_KEY;
  const pid = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;

  const isSample = !pk || pk.includes("SAMPLE_KEY") || pk.includes("your_firebase_private_key");

  if (!isSample && pid && email) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: pid,
          clientEmail: email,
          privateKey: pk.replace(/\\n/g, '\n'),
        })
      });
      db = admin.firestore();
      return;
    } catch (e) {}
  }
  db = new MockDB();
};

init();

module.exports = { db, admin };

