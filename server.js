const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("ERREUR : JWT_SECRET n'est pas configuré.");
  process.exit(1);
}
/*
====================================================
BASE DE DONNÉES
====================================================
*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});
/*
====================================================
 INITIALISATION
====================================================
*/
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
      country_id VARCHAR(10) NOT NULL,
      country VARCHAR(100) NOT NULL,
      country_code VARCHAR(20) NOT NULL,
      offer_id VARCHAR(50) NOT NULL,
      duration_days INTEGER NOT NULL,
      price INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL
        DEFAULT 'pending_payment',
      phone_number VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Base de données initialisée.");
}
/*
====================================================
 PAYS
====================================================
*/
const countries = [
  {
    id: "ma",
    name: "Maroc",
    flag: "🇲🇦",
    code: "+212"
  },
  {
    id: "tr",
    name: "Turquie",
    flag: "🇹🇷",
    code: "+90"
  },
  {
    id: "sn",
    name: "Sénégal",
    flag: "🇸🇳",
    code: "+221"
  }
];
/*
====================================================
 OFFRES
====================================================
*/
const offers = [
  {
    id: "day",
    name: "1 jour",
    durationDays: 1,
    price: 1500
  },
  {
    id: "week",
    name: "7 jours",
    durationDays: 7,
    price: 5000
  },
  {
    id: "month",
    name: "30 jours",
    durationDays: 30,
    price: 15000
  }
];
/*
====================================================
 ACCUEIL
====================================================
*/
app.get("/", (req, res) => {
  res.json({
    service: "VirtualNumber API",
    status: "online",
    version: "2.0.0"
  });
});
/*
====================================================
 HEALTH
====================================================
*/
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      status: "online",
      database: "connected"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      status: "online",
      database: "disconnected"
    });
  }
});
/*
====================================================
 PAYS
====================================================
*/
app.get("/api/countries", (req, res) => {
  res.json({
    success: true,
    countries
  });
});
/*
====================================================
 OFFRES
====================================================
*/
app.get("/api/offers", (req, res) => {
  const countryId =
    req.query.country;
  if (countryId) {
    const country =
      countries.find(
        item => item.id === countryId
      );
    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Pays introuvable."
      });
    }
    return res.json({
      success: true,
      country,
      offers
    });
  }
  res.json({
    success: true,
    offers
  });
});
/*
====================================================
 INSCRIPTION
====================================================
*/
app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const email =
        String(req.body.email || "")
          .trim()
          .toLowerCase();
      const password =
        String(req.body.password || "");
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email et mot de passe obligatoires."
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Le mot de passe doit contenir au moins 6 caractères."
        });
      }
      const existing =
        await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [email]
        );
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Cette adresse email est déjà utilisée."
        });
      }
      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );
      const result =
        await pool.query(
          `
          INSERT INTO users
          (email, password_hash)
          VALUES ($1, $2)
          RETURNING
          id,
          email,
          balance,
          created_at
          `,
          [
            email,
            passwordHash
          ]
        );
      const user =
        result.rows[0];
      res.status(201).json({
        success: true,
        message:
          "Compte créé avec succès.",
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 CONNEXION
====================================================
*/
app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const email =
        String(req.body.email || "")
          .trim()
          .toLowerCase();
      const password =
        String(req.body.password || "");
      const result =
        await pool.query(
          `
          SELECT
            id,
            email,
            password_hash,
            balance
          FROM users
          WHERE email = $1
          `,
          [email]
        );
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message:
            "Email ou mot de passe incorrect."
        });
      }
      const user =
        result.rows[0];
      const valid =
        await bcrypt.compare(
          password,
          user.password_hash
        );
      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Email ou mot de passe incorrect."
        });
      }
      const token =
        jwt.sign(
          {
            userId: user.id
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 AUTHENTIFICATION
====================================================
*/
function authenticate(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message:
        "Authentification requise."
    });
  }
  const token =
    header.substring(7);
  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );
    req.userId =
      decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        "Session invalide ou expirée."
    });
  }
}
/*
====================================================
 PROFIL
====================================================
*/
app.get(
  "/api/me",
  authenticate,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            email,
            balance,
            created_at
          FROM users
          WHERE id = $1
          `,
          [req.userId]
        );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Utilisateur introuvable."
        });
      }
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 CRÉER UNE COMMANDE
====================================================
*/
app.post(
  "/api/orders",
  authenticate,
  async (req, res) => {
    try {
      const {
        countryId,
        offerId
      } = req.body;
      const country =
        countries.find(
          item =>
            item.id === countryId
        );
      if (!country) {
        return res.status(400).json({
          success: false,
          message:
            "Pays invalide."
        });
      }
      const offer =
        offers.find(
          item =>
            item.id === offerId
        );
      if (!offer) {
        return res.status(400).json({
          success: false,
          message:
            "Offre invalide."
        });
      }
      const result =
        await pool.query(
          `
          INSERT INTO orders (
            user_id,
            country_id,
            country,
            country_code,
            offer_id,
            duration_days,
            price,
            status
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            'pending_payment'
          )
          RETURNING *
          `,
          [
            req.userId,
            country.id,
            country.name,
            country.code,
            offer.id,
            offer.durationDays,
            offer.price
          ]
        );
      res.status(201).json({
        success: true,
        message:
          "Commande créée.",
        order:
          result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 MES COMMANDES
====================================================
*/
app.get(
  "/api/orders",
  authenticate,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [req.userId]
        );
      res.json({
        success: true,
        orders:
          result.rows
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 ADMIN
====================================================
*/
app.get(
  "/api/admin/stats",
  async (req, res) => {
    try {
      const adminKey =
        req.headers["x-admin-key"];
      if (
        !process.env.ADMIN_KEY ||
        adminKey !== process.env.ADMIN_KEY
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Accès administrateur refusé."
        });
      }
      const users =
        await pool.query(
          "SELECT COUNT(*) FROM users"
        );
      const orders =
        await pool.query(
          "SELECT COUNT(*) FROM orders"
        );
      const revenue =
        await pool.query(`
          SELECT
            COALESCE(
              SUM(price),
              0
            ) AS revenue
          FROM orders
          WHERE status = 'paid'
        `);
      res.json({
        success: true,
        statistics: {
          users:
            Number(users.rows[0].count),
          orders:
            Number(orders.rows[0].count),
          revenue:
            Number(revenue.rows[0].revenue)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur."
      });
    }
  }
);
/*
====================================================
 404
====================================================
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      "Route introuvable."
  });
});
/*
====================================================
 DÉMARRAGE
====================================================
*/
initializeDatabase()
  .then(() => {
    app.listen(
      PORT,
      () => {
        console.log(
          `VirtualNumber API démarrée sur le port ${PORT}`
        );
      }
    );
  })
  .catch(error => {
    console.error(
      "Impossible d'initialiser la base :",
      error
    );
    process.exit(1);
  });