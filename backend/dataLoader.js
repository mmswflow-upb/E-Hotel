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
  "services",
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

  /* 2. Create services */
  console.log("✨ Services");
  const serviceIDs = [];
  const services = [
    {
      name: "WiFi",
      cost: 10,
      isOneTime: false,
      description: "High-speed internet access",
    },
    {
      name: "Breakfast",
      cost: 15,
      isOneTime: true,
      description: "Daily breakfast buffet",
    },
    {
      name: "Pool Access",
      cost: 20,
      isOneTime: false,
      description: "Access to hotel pool",
    },
    { name: "Spa", cost: 50, isOneTime: false, description: "Spa services" },
    {
      name: "Parking",
      cost: 15,
      isOneTime: false,
      description: "Secure parking space",
    },
    {
      name: "Room Service",
      cost: 25,
      isOneTime: false,
      description: "24/7 room service",
    },
    {
      name: "Gym Access",
      cost: 15,
      isOneTime: false,
      description: "Access to fitness center",
    },
    {
      name: "Laundry",
      cost: 20,
      isOneTime: false,
      description: "Laundry service",
    },
  ];

  for (const service of services) {
    const serviceID = await add("services", service);
    serviceIDs.push(serviceID);
  }

  /* 3. hotels + rooms */
  console.log("✨ Hotels & rooms");
  const hotelIDs = [],
    roomIDs = {};
  for (let h = 1; h <= 5; h++) {
    // Assign random services to each hotel
    const availableServiceIDs = serviceIDs
      .sort(() => 0.5 - rand())
      .slice(0, Math.floor(rand() * 3) + 3); // Each hotel gets 3-5 random services

    const hotelID = await add("hotels", {
      name: `Hotel ${h}`,
      address: `${h} Main`,
      starRating: 3 + (h % 3),
      totalRooms: 5,
      description: `Welcome to Hotel ${h}, a ${
        3 + (h % 3)
      }-star establishment located in the heart of the city. Our hotel offers comfortable accommodations and excellent service to make your stay memorable.`,
      availableServiceIDs,
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
        pricePerNight: r % 2 ? 100 : 150,
      });
      roomIDs[hotelID].push(rid);
    }
  }

  /* 4. bookings, payments, invoices */
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

      // Create service requests for the booking
      const hotel = await db.collection("hotels").doc(hotelID).get();
      const availableServices = hotel.data().availableServiceIDs;

      // Randomly select some services for this booking
      const selectedServices = availableServices
        .sort(() => 0.5 - rand())
        .slice(0, Math.floor(rand() * 3) + 1); // 1-3 services per booking

      const serviceCharges = [];
      for (const serviceID of selectedServices) {
        const service = await db.collection("services").doc(serviceID).get();
        const serviceData = service.data();

        await add("serviceRequests", {
          hotelID,
          bookingID,
          serviceID,
          roomID,
          quantity: serviceData.isOneTime ? 1 : Math.floor(rand() * 3) + 1,
          totalCost: serviceData.isOneTime
            ? serviceData.cost
            : serviceData.cost * (Math.floor(rand() * 3) + 1),
          status: "requested",
        });

        serviceCharges.push({
          serviceID,
          name: serviceData.name,
          cost: serviceData.cost,
          quantity: serviceData.isOneTime ? 1 : Math.floor(rand() * 3) + 1,
          total: serviceData.isOneTime
            ? serviceData.cost
            : serviceData.cost * (Math.floor(rand() * 3) + 1),
        });
      }

      // Create invoice with room and service charges
      const totalServiceCost = serviceCharges.reduce(
        (sum, charge) => sum + charge.total,
        0
      );
      await add("invoices", {
        hotelID,
        bookingID,
        roomCharges: [
          {
            roomID,
            pricePerNight: amt,
            nights: 2,
            total: amt * 2,
          },
        ],
        serviceCharges,
        totalAmount: amt * 2 + totalServiceCost,
        issueDate: admin.firestore.Timestamp.fromDate(co),
        status: "pending",
      });

      await add("paymentTransactions", {
        hotelID,
        bookingID,
        amount: amt,
        paymentMethod: "card",
        transactionDate: admin.firestore.Timestamp.fromDate(ci),
        status: "approved",
      });
    }
  }

  /* 5. cancellations */
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

  /* 6. stats */
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
