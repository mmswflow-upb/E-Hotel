// backend/dataLoader.js
//
// Fetches existing Firebase‑Auth users, uses them as
//   5 managers  → one per hotel
//   5 receptionists
//   10 tourists
//
// Creates extra users automatically if fewer than 20 exist.
// Produces deterministic seed data each run.

const { db, admin } = require("./firebase");

/* collections to wipe */
const COLLECTIONS = [
  "hotelManagers",
  "receptionists",
  "hotels",
  "rooms",
  "customers",
  "bookings",
  "cancellations",
  "paymentTransactions",
  "invoices",
  "serviceRequests",
  "stats",
];

/* deterministic rng */
function mulberry32(a) {
  return () =>
    (((a = Math.imul((a ^ (a >>> 15)) | 1, a | 1)) ^
      (a + Math.imul(a ^ (a >>> 7), a | 61))) >>>
      0) /
    4294967296;
}
const rand = mulberry32(42);

/* helpers ---------------------------------------------------------------- */
async function clear(col) {
  const snap = await db.collection(col).limit(500).get();
  if (snap.empty) return;
  const bat = db.batch();
  snap.docs.forEach((d) => bat.delete(d.ref));
  await bat.commit();
  return clear(col);
}
async function add(col, data) {
  return (await db.collection(col).add(data)).id;
}
async function ensureRole(uid, role) {
  const user = await admin.auth().getUser(uid);
  if (user.customClaims?.role !== role)
    await admin.auth().setCustomUserClaims(uid, { role });
}
/* ------------------------------------------------------------------------ */

async function fetchFirstNUsers(n) {
  const all = [];
  let nextPageToken;
  do {
    const page = await admin.auth().listUsers(1000, nextPageToken);
    all.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken && all.length < n);
  return all
    .filter((u) => u.email) // must have email
    .sort((a, b) => a.email.localeCompare(b.email)) // deterministic order
    .slice(0, n);
}

async function seed() {
  console.log("🔄 Clearing Firestore collections…");
  for (const c of COLLECTIONS) await clear(c);

  /* 1. get (or create) 20 users */
  let users = await fetchFirstNUsers(20);

  // If we still have <20, create temp accounts
  while (users.length < 20) {
    const i = users.length + 1;
    const email = `seed-user-${i}@example.com`;
    const temp = await admin
      .auth()
      .createUser({ email, password: "Passw0rd!" });
    users.push(await admin.auth().getUser(temp.uid));
  }

  /* partition */
  const managers = users.slice(0, 5);
  const receptionists = users.slice(5, 10);
  const customers = users.slice(10, 20);

  /* assign custom claims & Firestore docs */
  console.log("✨ Managers");
  for (let i = 0; i < managers.length; i++) {
    const u = managers[i];
    await ensureRole(u.uid, "HotelManager");
    await db
      .collection("hotelManagers")
      .doc(u.uid)
      .set({
        name: `Manager ${i + 1}`,
        email: u.email,
        hotelID: null, // assigned below
      });
  }

  console.log("✨ Receptionists");
  for (let i = 0; i < receptionists.length; i++) {
    const u = receptionists[i];
    await ensureRole(u.uid, "Receptionist");
    await db
      .collection("receptionists")
      .doc(u.uid)
      .set({
        name: `Receptionist ${i + 1}`,
        email: u.email,
        hotelID: null, // assigned below
      });
  }

  console.log("✨ Customers");
  for (let i = 0; i < customers.length; i++) {
    const u = customers[i];
    await ensureRole(u.uid, "Customer");
    await db
      .collection("customers")
      .doc(u.uid)
      .set({
        name: `Customer ${i + 1}`,
        phoneNumber: `+123456789${i}`,
        idType: ["passport", "id_card", "driver_license"][i % 3],
        idNumber: `ID${i + 1}`,
        balance: Number(Math.floor(rand() * 1000)), // Ensure balance is stored as a number
      });
  }

  /* 2. hotels + rooms */
  console.log("✨ Hotels & rooms");
  const hotelIDs = [],
    roomIDs = {};
  for (let h = 1; h <= 5; h++) {
    const hotelID = await add("hotels", {
      name: `Hotel ${h}`,
      address: `${h} Main`,
      starRating: 3 + (h % 3),
      totalRooms: 5,
    });
    hotelIDs.push(hotelID);
    roomIDs[hotelID] = [];

    await db
      .collection("hotelManagers")
      .doc(managers[h - 1].uid)
      .update({ hotelIDs: admin.firestore.FieldValue.arrayUnion(hotelID) });
    await db
      .collection("receptionists")
      .doc(receptionists[h - 1].uid)
      .update({ hotelID });

    for (let r = 1; r <= 5; r++) {
      const rid = await add("rooms", {
        hotelID,
        roomNumber: (h * 100 + r).toString(),
        type: r % 2 ? "single" : "double",
        status: "available",
        pricePerNight: r % 2 ? 100 : 150, // Single rooms cost 100, double rooms cost 150
      });
      roomIDs[hotelID].push(rid);
    }
  }

  /* 3. bookings, payments, invoices */
  console.log("✨ Bookings / payments / invoices");
  const now = new Date(),
    bookings = [];
  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i];
    for (let b = 0; b < 5; b++) {
      const hotelID = hotelIDs[(i + b) % hotelIDs.length];
      const roomID = roomIDs[hotelID][b];
      const ci = new Date(now.getTime() + (i * 5 + b) * 864e5);
      const co = new Date(ci.getTime() + 2 * 864e5);
      const amt = 150 + (b % 3) * 50;

      const bookingID = await add("bookings", {
        hotelID,
        customerID: cust.uid,
        roomDetails: [roomID],
        checkInDate: admin.firestore.Timestamp.fromDate(ci),
        checkOutDate: admin.firestore.Timestamp.fromDate(co),
        totalAmount: amt,
        status: "booked",
        createdAt: admin.firestore.Timestamp.fromDate(ci),
        cancellationGracePeriod: 24,
      });
      bookings.push({ bookingID, hotelID, cust: cust.uid, amount: amt });

      // Add service requests with specific prices
      await add("serviceRequests", {
        hotelID,
        bookingID,
        serviceType: "breakfast",
        price: 15,
      });
      await add("serviceRequests", {
        hotelID,
        bookingID,
        serviceType: "dinner",
        price: 25,
      });
      await add("serviceRequests", {
        hotelID,
        bookingID,
        serviceType: "internet",
        price: 10,
      });

      await add("paymentTransactions", {
        hotelID,
        bookingID,
        amount: amt,
        paymentMethod: "card",
        transactionDate: admin.firestore.Timestamp.fromDate(ci),
        status: "approved",
      });
      await add("invoices", {
        hotelID,
        bookingID,
        itemizedCharges: [`Room:${amt}`, "Breakfast:15"],
        totalAmount: amt + 15,
        issueDate: admin.firestore.Timestamp.fromDate(co),
      });
    }
  }

  /* 4. cancellations */
  console.log("✨ Cancellations");
  for (const cust of customers) {
    const mine = bookings.filter((b) => b.cust === cust.uid);
    const n = rand() < 0.5 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const bk = mine[i];
      await add("cancellations", {
        hotelID: bk.hotelID,
        bookingID: bk.bookingID,
        canceledBy: cust.uid,
        cancellationTime: admin.firestore.Timestamp.now(),
        penaltyApplied: 50,
      });
      await db
        .collection("bookings")
        .doc(bk.bookingID)
        .update({ status: "canceled" });
    }
  }

  /* 5. stats */
  console.log("✨ Monthly stats");
  const base = new Date();
  for (const hotelID of hotelIDs) {
    const count = rand() < 0.5 ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      await add("stats", {
        reportID: `${hotelID}-${period}`,
        hotelID,
        period,
        totalRevenue: 8000 + i * 400,
        occupancyRate: 0.7 - i * 0.02,
        cancellationCount: 2 + (i % 2),
      });
    }
  }

  console.log("✅ Seed complete (5 hotels, users fetched from Auth)");
}

/* exported for server.js */
module.exports = { seed };
