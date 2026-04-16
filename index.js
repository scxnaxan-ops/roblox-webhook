const express = require("express");
const app = express();
app.use(express.json());

const donations = [];
let nextId = 1;
const SECRET = process.env.SECRET_TOKEN || "saweria_naxan_2026";
const MAX_DONATIONS = 200;

// Health check
app.get("/", (req, res) => {
    res.send("Webhook aktif!");
});

// Terima donasi dari Saweria
app.post("/webhook", (req, res) => {
    const token = req.query.token || req.headers["x-secret-token"];
    if (token !== SECRET) {
        console.log("Ditolak! Token salah dari:", req.ip);
        return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;
    console.log("RAW BODY:", JSON.stringify(body));

    // Coba semua kemungkinan nama field amount dari Saweria
    const rawAmount = body.amount ?? body.nominal ?? body.price ?? body.total ?? 0;
    const amount = parseFloat(String(rawAmount).replace(/[^0-9.]/g, "")) || 0;

    const donation = {
        id: nextId++,
        donator_name: body.donator_name || body.name || body.username || "Anonim",
        amount: amount,
        message: body.message || "",
        currency: body.currency || "IDR",
        time: Date.now()
    };

    console.log("PARSED donation:", JSON.stringify(donation));

    donations.push(donation);

    // Batasi memory
    if (donations.length > MAX_DONATIONS) {
        donations.splice(0, donations.length - MAX_DONATIONS);
    }

    res.json({ success: true });
});

// Poll semua donasi
app.get("/poll", (req, res) => {
    res.json({ donations });
});

// Poll donasi baru (untuk Roblox) - filter by time only
app.get("/poll/latest", (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const filtered = donations.filter(d => d.time > since);
    res.json({ donations: filtered });
});

// Status
app.get("/status", (req, res) => {
    res.json({
        status: "online",
        totalDonations: donations.length,
        time: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
});
