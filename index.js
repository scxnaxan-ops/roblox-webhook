const express = require("express");
const app = express();
app.use(express.json());

const donations = [];
let nextId = 1;

// Ganti token ini dengan kata rahasia kamu!
const SECRET = "saweria_naxan_2026";

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
    console.log("Donasi masuk:", body);

    const donation = {
        id: nextId++,
        donator_name: body.donator_name || body.name || "Anonim",
        amount: body.amount || 0,
        message: body.message || "",
        currency: body.currency || "IDR",
        time: Date.now()
    };

    donations.push(donation);
    res.json({ success: true });
});

// Ambil semua donasi
app.get("/poll", (req, res) => {
    res.json({ donations: donations });
});

// Ambil donasi baru saja (untuk Roblox polling)
app.get("/poll/latest", (req, res) => {
    const after = parseInt(req.query.after) || 0;
    const since = parseInt(req.query.since) || 0;
    const filtered = donations.filter(d => d.id > after && d.time > since);
    res.json({ donations: filtered });
});

// Status server
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
