const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
    console.log("Data masuk:", req.body);
    res.send("ok");
});

app.get("/", (req, res) => {
    res.send("Webhook aktif");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
});
