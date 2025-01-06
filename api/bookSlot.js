const admin = require("firebase-admin");
require("dotenv").config();
const cors = require("cors");

const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"]
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
 corsMiddleware(req,res,async()=>{
    const { date, time, userId } = req.body;

  if (!date || !time || !userId) {
    return res.status(400).json({ message: "Date, time, and userId are required" });
  }

  try {
    const docRef = db.collection("availability").doc(date);
    const docSnap = await docRef.get();

    if (!docSnap.exists || !docSnap.data().slots.includes(time)) {
      return res.status(404).json({ message: "Slot not available" });
    }

    await docRef.update({
      slots: admin.firestore.FieldValue.arrayRemove(time),
    });

    await db.collection("bookings").add({ date, time, userId });

    res.status(200).json({ message: "Slot booked successfully!" });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
 })
  
};
