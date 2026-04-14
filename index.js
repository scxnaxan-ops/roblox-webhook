const express = require("express");
const app = express();
app.use(express.json());

// Simpan donasi di memory
const donations = [];
let nextId = 1;

// Health check
app.get("/", (req, res) => {
    res.send("Webhook aktif!");
});

// Terima donasi dari Saweria
app.post("/webhook", (req, res) => {
    const body = req.body;
    console.log("Donasi masuk:", body);

    const donation = {
        id: nextId++,
        donator_name: body.donator_name || body.name || "Anonim",
        amount: body.amount || 0,
        message: body.message || "",
        currency: body.currency || "IDR",
        time: new Date().toISOString()
    };

    donations.push(donation);
    res.json({ success: true });
});

// Ambil semua donasi
app.get("/poll", (req, res) => {
    res.json({ donations: donations });
});

// Ambil donasi terbaru setelah ID tertentu
app.get("/poll/latest", (req, res) => {
    const after = parseInt(req.query.after) || 0;
    const filtered = donations.filter(d => d.id > after);
    res.json({ donations: filtered });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
});
