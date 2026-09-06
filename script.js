   VIRTUAL NUMBER
   SCRIPT COMPLET - VERSION 1
   ===================================================== */

/* =====================================================
   DONNÉES DES PAYS
   ===================================================== */

const countries = {
  Maroc: {
    code: "+212",
    flag: "🇲🇦"
  },

  Turquie: {
    code: "+90",
    flag: "🇹🇷"
  },

  Sénégal: {
    code: "+221",
    flag: "🇸🇳"
  }
};


/* =====================================================
   ÉTAT DU SITE
   ===================================================== */

let selectedCountry = null;

let currentUser = null;


/* =====================================================
   SÉLECTION DU PAYS
   ===================================================== */

function selectCountry(country, code) {

  selectedCountry = country;

  const title =
    document.getElementById("selectedCountryTitle");

  title.innerHTML =
    `${countries[country].flag} Offres ${country}`;

  generateOffers(country);

  document
    .getElementById("offres")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =====================================================
   GÉNÉRER LES OFFRES
   ===================================================== */

function generateOffers(country) {

  const container =
    document.getElementById("offersContainer");

  const data = countries[country];

  container.innerHTML = `

    <!-- 1 JOUR -->

    <div class="offer-card">

      <h3>📱 Numéro ${country}</h3>

      <div class="offer-price">
        1 500 FCFA
      </div>

      <div class="offer-duration">
        Location pendant 1 jour
      </div>

      <button
        class="offer-btn"
        onclick="buyOffer('${country}', 1500, '1 jour')">

        Choisir cette offre

      </button>

    </div>


    <!-- 7 JOURS -->

    <div class="offer-card popular">

      <div class="popular-label">
        POPULAIRE
      </div>

      <h3>📱 Numéro ${country}</h3>

      <div class="offer-price">
        5 000 FCFA
      </div>

      <div class="offer-duration">
        Location pendant 7 jours
      </div>

      <button
        class="offer-btn"
        onclick="buyOffer('${country}', 5000, '7 jours')">

        Choisir cette offre

      </button>

    </div>


    <!-- 30 JOURS -->

    <div class="offer-card">

      <h3>📱 Numéro ${country}</h3>

      <div class="offer-price">
        15 000 FCFA
      </div>

      <div class="offer-duration">
        Location pendant 30 jours
      </div>

      <button
        class="offer-btn"
        onclick="buyOffer('${country}', 15000, '30 jours')">

        Choisir cette offre

      </button>

    </div>

  `;
}


/* =====================================================
   ACHETER UNE OFFRE
   ===================================================== */

function buyOffer(country, price, duration) {

  const data = countries[country];

  const confirmation = confirm(

    `${data.flag} ${country}\n\n` +

    `📞 Numéro virtuel : ${data.code}\n` +

    `⏱️ Durée : ${duration}\n` +

    `💰 Prix : ${price.toLocaleString()} FCFA\n\n` +

    `Continuer la commande ?`

  );


  if (!confirmation) {
    return;
  }


  showNotification(
    "Commande créée. Paiement à configurer."
  );


  setTimeout(() => {

    openPaymentPage(
      country,
      price,
      duration
    );

  }, 800);

}


/* =====================================================
   PAGE DE PAIEMENT
   ===================================================== */

function openPaymentPage(country, price, duration) {

  const existing =
    document.getElementById("paymentModal");

  if (existing) {
    existing.remove();
  }


  const modal =
    document.createElement("div");

  modal.id = "paymentModal";


  modal.innerHTML = `

    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.6);
      z-index:3000;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    ">

      <div style="
        width:100%;
        max-width:430px;
        background:white;
        border-radius:20px;
        padding:30px;
        text-align:center;
      ">

        <div style="
          font-size:42px;
          margin-bottom:10px;
        ">
          💳
        </div>

        <h2>Paiement</h2>

        <p style="
          color:#64748b;
          margin:10px 0 20px;
        ">

          ${countries[country].flag}
          Numéro ${country}

          <br>

          ${duration}

        </p>


        <div style="
          font-size:30px;
          font-weight:800;
          margin-bottom:25px;
        ">

          ${price.toLocaleString()} FCFA

        </div>


        <button
          onclick="startPayment()"
          style="
            width:100%;
            padding:14px;
            border:0;
            border-radius:10px;
            background:#2563eb;
            color:white;
            font-weight:700;
            cursor:pointer;
          ">

          Continuer vers le paiement

        </button>


        <button
          onclick="closePayment()"
          style="
            width:100%;
            padding:12px;
            margin-top:10px;
            border:0;
            background:#f1f5f9;
            border-radius:10px;
            cursor:pointer;
          ">

          Annuler

        </button>

      </div>

    </div>

  `;


  document.body.appendChild(modal);

}


/* =====================================================
   DÉMARRER PAIEMENT
   ===================================================== */

function startPayment() {

  showNotification(
    "Le système de paiement sera connecté prochainement."
  );

}


/* =====================================================
   FERMER PAIEMENT
   ===================================================== */

function closePayment() {

  const modal =
    document.getElementById("paymentModal");

  if (modal) {
    modal.remove();
  }

}


/* =====================================================
   MENU MOBILE
   ===================================================== */

function toggleMenu() {

  const menu =
    document.getElementById("navMenu");

  menu.classList.toggle("active");

}


/* =====================================================
   CONNEXION
   ===================================================== */

function login(event) {

  event.preventDefault();


  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  if (!email || !password) {

    showNotification(
      "Veuillez remplir tous les champs."
    );

    return;
  }


  /*
    POUR L'INSTANT :

    Connexion locale de démonstration.

    Plus tard nous remplacerons ceci
    par une vraie connexion au serveur.
  */


  currentUser = {
    email: email
  };


  localStorage.setItem(
    "virtualNumberUser",
    JSON.stringify(currentUser)
  );


  showNotification(
    "Connexion réussie."
  );


  setTimeout(() => {

    showDashboard();

  }, 700);

}


/* =====================================================
   INSCRIPTION
   ===================================================== */

function showRegister() {

  const modal =
    document.createElement("div");

  modal.id = "registerModal";


  modal.innerHTML = `

    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.6);
      z-index:3000;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    ">

      <div style="
        width:100%;
        max-width:430px;
        background:white;
        border-radius:20px;
        padding:30px;
      ">

        <h2 style="
          text-align:center;
          margin-bottom:20px;
        ">
          Créer un compte
        </h2>


        <input
          id="registerEmail"
          type="email"
          placeholder="Adresse e-mail"
          style="
            width:100%;
            height:48px;
            padding:0 14px;
            border:1px solid #d1d5db;
            border-radius:10px;
            margin-bottom:12px;
          "
        >


        <input
          id="registerPassword"
          type="password"
          placeholder="Mot de passe"
          style="
            width:100%;
            height:48px;
            padding:0 14px;
            border:1px solid #d1d5db;
            border-radius:10px;
            margin-bottom:15px;
          "
        >


        <button
          onclick="registerUser()"
          style="
            width:100%;
            padding:14px;
            border:0;
            border-radius:10px;
            background:#2563eb;
            color:white;
            font-weight:700;
          "
        >

          Créer mon compte

        </button>


        <button
          onclick="closeRegister()"
          style="
            width:100%;
            padding:12px;
            margin-top:10px;
            border:0;
            background:#f1f5f9;
            border-radius:10px;
          "
        >

          Annuler

        </button>

      </div>

    </div>

  `;


  document.body.appendChild(modal);

}


/* =====================================================
   CRÉER UTILISATEUR
   ===================================================== */

function registerUser() {

  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim();


  const password =
    document
      .getElementById("registerPassword")
      .value;


  if (!email || !password) {

    showNotification(
      "Veuillez remplir tous les champs."
    );

    return;
  }


  if (password.length < 6) {

    showNotification(
      "Le mot de passe doit contenir au moins 6 caractères."
    );

    return;
  }


  const user = {
    email: email,
    password: password
  };


  /*
    IMPORTANT :

    Cette sauvegarde est seulement temporaire
    pour notre prototype.

    Nous ne devons pas stocker les vrais mots
    de passe comme ceci en production.

    Le vrai système utilisera le serveur,
    le hash du mot de passe et une base de données.
  */


  localStorage.setItem(
    "virtualNumberAccount",
    JSON.stringify(user)
  );


  closeRegister();


  showNotification(
    "Compte créé avec succès."
  );


  document
    .getElementById("email")
    .value = email;

}


/* =====================================================
   FERMER INSCRIPTION
   ===================================================== */

function closeRegister() {

  const modal =
    document.getElementById("registerModal");

  if (modal) {
    modal.remove();
  }

}


/* =====================================================
   TABLEAU DE BORD
   ===================================================== */

function showDashboard() {

  const user =
    JSON.parse(
      localStorage.getItem("virtualNumberUser")
    );


  const modal =
    document.createElement("div");

  modal.id = "dashboardModal";


  modal.innerHTML = `

    <div style="
      position:fixed;
      inset:0;
      background:#f5f7fb;
      z-index:2500;
      overflow:auto;
      padding:25px;
    ">

      <div style="
        max-width:900px;
        margin:auto;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          margin-bottom:30px;
        ">

          <div>

            <div style="
              font-size:13px;
              color:#64748b;
            ">
              Espace client
            </div>

            <h1>
              Bonjour 👋
            </h1>

            <p style="
              color:#64748b;
            ">
              ${user ? user.email : ""}
            </p>

          </div>


          <button
            onclick="logout()"
            style="
              padding:10px 15px;
              border:0;
              border-radius:10px;
              background:#fee2e2;
              color:#b91c1c;
              font-weight:700;
            "
          >
            Déconnexion
          </button>

        </div>


        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(200px,1fr));
          gap:15px;
        ">


          <div style="
            background:white;
            padding:25px;
            border-radius:18px;
            border:1px solid #e5e7eb;
          ">

            <div style="font-size:30px;">
              📱
            </div>

            <h3>
              Mes numéros
            </h3>

            <p style="color:#64748b;">
              Aucun numéro actif
            </p>

          </div>


          <div style="
            background:white;
            padding:25px;
            border-radius:18px;
            border:1px solid #e5e7eb;
          ">

            <div style="font-size:30px;">
              🧾
            </div>

            <h3>
              Commandes
            </h3>

            <p style="color:#64748b;">
              Aucune commande
            </p>

          </div>


          <div style="
            background:white;
            padding:25px;
            border-radius:18px;
            border:1px solid #e5e7eb;
          ">

            <div style="font-size:30px;">
              💰
            </div>

            <h3>
              Solde
            </h3>

            <p style="color:#64748b;">
              0 FCFA
            </p>

          </div>


        </div>


        <div style="
          margin-top:20px;
          background:white;
          padding:25px;
          border-radius:18px;
          border:1px solid #e5e7eb;
        ">

          <h2>
            Mes numéros
          </h2>

          <div style="
            text-align:center;
            padding:45px 15px;
            color:#64748b;
          ">

            📭

            <br><br>

            Vous n'avez encore aucun numéro.

          </div>

        </div>


        <button
          onclick="closeDashboard()"
          style="
            margin-top:20px;
            padding:13px 20px;
            border:0;
            border-radius:10px;
            background:#2563eb;
            color:white;
            font-weight:700;
          "
        >

          Retour au site

        </button>

      </div>

    </div>

  `;


  document.body.appendChild(modal);

}


/* =====================================================
   FERMER DASHBOARD
   ===================================================== */

function closeDashboard() {

  const modal =
    document.getElementById("dashboardModal");

  if (modal) {
    modal.remove();
  }

}


/* =====================================================
   DÉCONNEXION
   ===================================================== */

function logout() {

  localStorage.removeItem(
    "virtualNumberUser"
  );


  closeDashboard();


  showNotification(
    "Vous êtes déconnecté."
  );

}


/* =====================================================
   NOTIFICATION
   ===================================================== */

function showNotification(message) {

  const notification =
    document.getElementById("notification");

  const text =
    document.getElementById("notificationText");


  if (!notification || !text) {
    return;
  }


  text.textContent = message;


  notification.classList.add("show");


  setTimeout(() => {

    notification.classList.remove("show");

  }, 3000);

}


/* =====================================================
   RESTAURATION SESSION
   ===================================================== */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    const savedUser =
      localStorage.getItem(
        "virtualNumberUser"
      );


    if (savedUser) {

      try {

        currentUser =
          JSON.parse(savedUser);

      } catch (error) {

        localStorage.removeItem(
          "virtualNumberUser"
        );

      }

    }

  }
);