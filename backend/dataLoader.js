// dataLoader.js
// Dev loader: wipes Firestore & then seeds 20 entries per collection, using existing Auth users.

const { db, admin } = require('./firebase');

// The 9 collections we want to reset
const COLLECTIONS = [
  'hotels',
  'rooms',
  'customers',
  'bookings',
  'cancellations',
  'paymentTransactions',
  'invoices',
  'serviceRequests',
  'stats'
];

/** Recursively delete all docs in a collection */
async function clearCollection(path) {
  try {
    const col = db.collection(path);
    const snap = await col.limit(500).get();
    if (snap.empty) {
      console.log(` • [skip] no docs in "${path}"`);
      return;
    }
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(` • [cleared] "${path}" (${snap.size} docs)`);
    return clearCollection(path);
  } catch (err) {
    if (err.code === 5) {
      console.log(` • [skip] collection "${path}" not found`);
      return;
    }
    throw err;
  }
}

/** Add a Firestore doc, log it, return its new ID */
async function addDoc(col, data, label) {
  const ref = await db.collection(col).add(data);
  console.log(` • ${label}: ${ref.id}`);
  return ref.id;
}

/** Capitalize a string */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function seed() {
  console.log('🔄 Clearing Firestore collections…');
  for (const c of COLLECTIONS) {
    await clearCollection(c);
  }

  console.log('✨ Fetching existing Firebase Auth users…');
  // Fetch up to 1000, then take the first 20 with emails
  const list = await admin.auth().listUsers(1000);
  const users = list.users.filter(u => u.email).slice(0, 20);
  if (users.length < 20) {
    throw new Error(`Expected >=20 Auth users, found ${users.length}`);
  }
  const customerUIDs = users.map(u => u.uid);

  console.log('✨ Seeding customers from Auth users…');
  // Create a customer doc for each user, using uid as doc ID
  await Promise.all(users.map(async (u, idx) => {
    const name = capitalize(u.email.split('@')[0]);
    const data = {
      name,
      contactInfo: u.email,
      identification: `ID-${1000 + idx + 1}`
    };
    await db.collection('customers').doc(u.uid).set(data);
    console.log(` • customer doc: ${u.uid} (${u.email})`);
  }));

  const now = new Date();

  // 1) Hotels (20)
  console.log('✨ Seeding hotels (20)…');
  const hotelIDs = [];
  for (let i = 1; i <= 20; i++) {
    hotelIDs.push(
      await addDoc('hotels', {
        name:       `Hotel ${i}`,
        address:    `${i} Main St`,
        starRating: 3 + (i % 3),
        totalRooms: 5 + (i % 5)
      }, `hotel #${i}`)
    );
  }

  // 2) Rooms (20)
  console.log('✨ Seeding rooms (20)…');
  const roomIDs = [];
  for (let i = 1; i <= 20; i++) {
    const hotelID = hotelIDs[Math.floor(Math.random() * hotelIDs.length)];
    roomIDs.push(
      await addDoc('rooms', {
        hotelID,
        roomNumber: (100 + i).toString(),
        type:       i % 2 === 0 ? 'double' : 'single',
        status:     'available'
      }, `room #${i}`)
    );
  }

  // 3) Bookings (20)
  console.log('✨ Seeding bookings (20)…');
  const bookings = [];
  for (let i = 1; i <= 20; i++) {
    const hotelID    = hotelIDs[Math.floor(Math.random() * hotelIDs.length)];
    const customerID = customerUIDs[Math.floor(Math.random() * customerUIDs.length)];
    // pick a room for that hotel if possible
    const candidates = roomIDs.filter((_, idx) => hotelIDs[idx % hotelIDs.length] === hotelID);
    const roomID     = candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : roomIDs[Math.floor(Math.random() * roomIDs.length)];
    const ci     = new Date(now.getTime() + Math.floor(Math.random() * 5)*24*3600e3);
    const co     = new Date(ci.getTime()       + (1 + Math.floor(Math.random()*3))*24*3600e3);
    const amt    = 100 + Math.floor(Math.random() * 400);

    const bookingID = await addDoc('bookings', {
      hotelID,
      customerID,
      roomDetails:              [roomID],
      checkInDate:              admin.firestore.Timestamp.fromDate(ci),
      checkOutDate:             admin.firestore.Timestamp.fromDate(co),
      cancellationGracePeriod:  24,
      totalAmount:              amt,
      status:                   'booked',
      createdAt:                admin.firestore.Timestamp.fromDate(ci)
    }, `booking #${i}`);

    bookings.push({ bookingID, hotelID, customerID, amount: amt, ci, co });
  }

  // 4) ServiceRequests (20)
  console.log('✨ Seeding serviceRequests (20)…');
  const svcTypes = ['breakfast','internet','dinner'];
  for (let i = 1; i <= 20; i++) {
    const b   = bookings[Math.floor(Math.random() * bookings.length)];
    const svc = svcTypes[Math.floor(Math.random() * svcTypes.length)];
    const price = svc === 'breakfast' ? 15 : svc === 'dinner' ? 25 : 5;
    await addDoc('serviceRequests', {
      hotelID:     b.hotelID,
      bookingID:   b.bookingID,
      serviceType: svc,
      price
    }, `serviceRequest #${i}`);
  }

  // 5) PaymentTransactions (20)
  console.log('✨ Seeding paymentTransactions (20)…');
  for (let i = 1; i <= 20; i++) {
    const b = bookings[Math.floor(Math.random() * bookings.length)];
    const td = b.co || b.ci;
    await addDoc('paymentTransactions', {
      hotelID:         b.hotelID,
      bookingID:       b.bookingID,
      amount:          b.amount,
      paymentMethod:   Math.random()<0.5 ? 'card' : 'cash',
      transactionDate: admin.firestore.Timestamp.fromDate(td),
      status:          'approved'
    }, `paymentTransaction #${i}`);
  }

  // 6) Invoices (20)
  console.log('✨ Seeding invoices (20)…');
  for (let i = 1; i <= 20; i++) {
    const b = bookings[Math.floor(Math.random() * bookings.length)];
    const dt = b.co || b.ci;
    await addDoc('invoices', {
      hotelID:         b.hotelID,
      bookingID:       b.bookingID,
      itemizedCharges: [`Room: ${b.amount}`],
      totalAmount:     b.amount,
      issueDate:       admin.firestore.Timestamp.fromDate(dt)
    }, `invoice #${i}`);
  }

  // 7) Cancellations (20)
  console.log('✨ Seeding cancellations (20)…');
  for (let i = 1; i <= 20; i++) {
    const b        = bookings[Math.floor(Math.random() * bookings.length)];
    const cancelAt = new Date(b.ci.getTime() + Math.floor(Math.random()*48)*3600e3);
    const penalty  = cancelAt - b.ci > 24*3600e3 ? Math.round(b.amount*0.5) : 0;
    await addDoc('cancellations', {
      hotelID:         b.hotelID,
      bookingID:       b.bookingID,
      canceledBy:      b.customerID,
      cancellationTime: admin.firestore.Timestamp.fromDate(cancelAt),
      penaltyApplied:  penalty
    }, `cancellation #${i}`);
    // mark booking canceled
    await db.collection('bookings').doc(b.bookingID)
      .update({ status:'canceled' });
  }

  // 8) StatsReports (20)
  console.log('✨ Seeding stats (20)…');
  for (let i = 1; i <= 20; i++) {
    const hotelID = hotelIDs[(i-1) % hotelIDs.length];
    const dt      = new Date(now.getFullYear(), now.getMonth() - ((i-1)%12), 1);
    const period  = `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2,'0')}`;
    const totalB  = 20;
    const cancCnt = Math.floor(Math.random() * 10);
    const compCnt = totalB - cancCnt;
    const rev     = compCnt * (100 + Math.floor(Math.random()*400));
    const occ     = totalB ? (compCnt/totalB) : 0;

    await addDoc('stats', {
      reportID:          `${hotelID}-${period}`,
      hotelID,
      period,
      totalRevenue:      rev,
      occupancyRate:     occ,
      cancellationCount: cancCnt
    }, `statsReport #${i}`);
  }

  console.log('✅ Seeding complete!');
}

module.exports = seed;
