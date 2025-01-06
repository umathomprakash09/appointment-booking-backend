const admin = require("firebase-admin");
require("dotenv").config();

const cors = require("cors");

const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: false
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
  console.log('Outside cors');
 corsMiddleware(req,res, async()=>{
    const { date } = req.query;
  console.log('Inside cors ',date);
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    const docRef = db.collection("availability").doc(date);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "No slots available for this date." });
    }

    res.status(200).json({ slots: docSnap.data().slots || [] });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
 })
  
};
