require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔍 DEBUG TEMPORAIRE (à enlever après)
console.log("MONGO_URI =", process.env.MONGO_URI);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connexion MongoDB réussie"))
    .catch(err => console.error("❌ Erreur de connexion:", err));

// Schema
const contactSchema = new mongoose.Schema({
    nom: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Route
app.post('/contact', async (req, res) => {
    try {
        const nouveauMessage = new Contact(req.body);
        await nouveauMessage.save();
        res.status(201).json({ message: "Message bien reçu !" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
