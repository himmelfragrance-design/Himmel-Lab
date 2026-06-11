import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

// Initial Mock Database State
const DEFAULT_DB = {
  portfolio: [
    { id: "1", title: "Midnight Oudh", category: "premium", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600" },
    { id: "2", title: "Summer Rain", category: "standard", image: "https://images.unsplash.com/photo-1595425959632-34f2822320da?auto=format&fit=crop&q=80&w=600" },
    { id: "3", title: "Saffron Mist", category: "premium", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600" },
    { id: "4", title: "Elysian Woods", category: "basic", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600" },
    { id: "5", title: "Citrus Breeze", category: "economic", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600" }
  ],
  customers: [
    { email: "ahmad@gmail.com", name: "Ahmad Rifai", points: 450, totalSpent: 1250000, lastOrder: "2026-06-01" },
    { email: "citra@yahoo.com", name: "Citra Dewi", points: 150, totalSpent: 495000, lastOrder: "2026-06-05" }
  ],
  orders: [
    {
      orderId: "HIM-982405",
      date: "2026-06-01",
      customerName: "Ahmad Rifai",
      customerEmail: "ahmad@gmail.com",
      customerAddress: "Jl. Sudirman No. 12, Jakarta Selatan",
      perfumeName: "Golden Sandalwood",
      category: "premium",
      amount: 1250000,
      status: "Selesai",
      moods: ["Woody", "Bold"],
      story: "Aroma kayu cendana hangat dengan nuansa maskulin dan rempah yang mewah."
    },
    {
      orderId: "HIM-174820",
      date: "2026-06-05",
      customerName: "Citra Dewi",
      customerEmail: "citra@yahoo.com",
      customerAddress: "Jl. Diponegoro No. 44, Bandung",
      perfumeName: "Velvet Rose",
      category: "standard",
      amount: 495000,
      status: "Curing",
      moods: ["Elegant", "Sweet"],
      story: "Aroma bunga mawar berembun pagi hari dicampur vanila manis yang anggun."
    }
  ],
  redeemCodes: [
    { id: "r1", email: "ahmad@gmail.com", rewardName: "Voucher 50rb", pointsSpent: 100, code: "HML-VO-A893", timestamp: "2026-06-02" }
  ],
  emails: [
    {
      id: "e1",
      to: "pujikurnia.work@gmail.com",
      subject: "HIMMEL LAB - System Initialized",
      body: "Himmel Lab Bespoke Perfumery system is successfully online. Sandbox monitoring activated.",
      timestamp: "2026-06-11T07:50:52Z"
    }
  ],
  rewards: [
    { id: "rw1", name: "Luxury Vial Sample 3ml Bespoke", cost: 30, desc: "Sample racikan aroma artisan khusus pilihan pakar parfum dengan aroma personal." },
    { id: "rw2", name: "Luxury Vial Sample 5ml Bespoke", cost: 50, desc: "Sample 5ml racikan aroma modern bernuansa wood/clean." },
    { id: "rw3", name: "Voucher Potongan Belanja Rp 50.000", cost: 80, desc: "Potongan harga langsung pada order bespoke berikutnya." },
    { id: "rw4", name: "Bespoke Bottle 30ml Basic (Aroma Bebas)", cost: 200, desc: "Gunakan poin Anda untuk menukar satu botol parfum 30ml gratis!" }
  ]
};

// Helper read/write database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const db = JSON.parse(data);
    
    // Defensive upgrade to add rewards if they do not exist
    if (!db.rewards) {
      db.rewards = DEFAULT_DB.rewards;
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    }
    return db;
  } catch (err) {
    console.error("Error reading db.json, returning default empty structure", err);
    return DEFAULT_DB;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Lazy Gemini API client initializer
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return ai;
}

// Setup basic Express parsing
app.use(express.json());

// API 1: Scent story analyzer AI with Gemini fallback
app.post("/api/analyze-scent", async (req, res) => {
  const { story, category, moods } = req.body;
  if (!story || story.trim().length === 0) {
    return res.status(400).json({ error: "Story is required" });
  }

  const client = getGeminiClient();
  const promptContext = `
    You are the Master Perfumer AI of Himmel Lab INDONESIA, a high-end luxury bespoke perfumery.
    Based on the fragrance story below, analyze and formulate a custom bespoke fragrance formula.
    Category chosen: ${category || "standard"}
    Aroma moods chosen: ${Array.isArray(moods) ? moods.join(", ") : "Free Mood"}
    
    Aroma Story from customer:
    "${story}"
    
    Extract or formulate exactly the following fields. Please respond with a clean, raw JSON output that matches this interface:
    {
      "top": "string (e.g. Orange Blossom & Bergamot, maximum 4 words)",
      "middle": "string (e.g. Saffron & Damask Rose, maximum 4 words)",
      "base": "string (e.g. Agarwood (Oud) & Amber, maximum 4 words)",
      "scentName": "string (an elegant creative names for the custom perfume, in English, 2-3 words)",
      "storyAnalysis": "string (a beautiful, poetical narrative in INDONESHIAN explaining why these notes fit their mood, strictly 2-3 high-end sentences)"
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      
      const txt = response.text || "";
      const parsed = JSON.parse(txt.trim());
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini call failed or failed to parse JSON, falling back to rule-based parser.", err);
    }
  }

  // Purely native elegant keyword/rule-based backup analyzer in Indonesian if Gemini is not set up
  const text = story.toLowerCase();
  let top = "Bergamot & fresh Lemon";
  let middle = "Jasmine & White Rose";
  let base = "Vanilla & Sandalwood";
  let scentName = "Himmel Eternal Scent";
  let storyAnalysis = "Kombinasi aroma ini dirancang untuk membangkitkan keanggunan alami yang hangat dan menenangkan kenangan indah Anda.";

  if (text.includes("hujan") || text.includes("rain") || text.includes("fresh") || text.includes("basah") || text.includes("dingin")) {
    top = "Ozone & Wild Bergamot";
    middle = "Wet Grass & Bamboo Leaf";
    base = "Vetiver & Patchouli";
    scentName = "Pluviophile Breeze";
    storyAnalysis = "Berdasarkan rincian cerita Anda, aroma petrikor tanah basah digabungkan dengan segarnya ozon membangkitkan suasana tenang menenangkan bagaikan hujan sore hari.";
  } else if (text.includes("mewah") || text.includes("mahal") || text.includes("pesta") || text.includes("malam") || text.includes("bold") || text.includes("night")) {
    top = "Saffron & Pink Pepper";
    middle = "Damask Rose & Cinnamon";
    base = "Premium Oudh & Amberwood";
    scentName = "Imperial Oudh Nectar";
    storyAnalysis = "Formulasi premium dengan Oudh alami dikombinasikan Saffron mewah sangat memancarkan karisma glamor, kehangatan intim, dan kemewahan malam misterius.";
  } else if (text.includes("wood") || text.includes("hutan") || text.includes("pohon") || text.includes("alam") || text.includes("bumi") || text.includes("cendana")) {
    top = "Pine Needle & Cardamom";
    middle = "Virginia Cedarwood";
    base = "Mysore Sandalwood & Amber";
    scentName = "Forest Solitude";
    storyAnalysis = "Suasana hutan belantara alami yang misterius dihadirkan lewat kesegaran Cedarwood dan kemegahan Sandalwood, memberikan rasa kokoh, maskulin, dan kedamaian mendalam.";
  } else if (text.includes("manis") || text.includes("sweet") || text.includes("kue") || text.includes("buah") || text.includes("bunga") || text.includes("candy")) {
    top = "Ripe Berry & Sweet Peach";
    middle = "Magnolia & Caramel Blush";
    base = "Warm Vanilla & White Musk";
    scentName = "Dolce Whispers";
    storyAnalysis = "Nuansa buah berry segar dipadukan gula karamel dan vanilla menciptakan memori manis yang ceria, membawa kehangatan kasual penuh daya tarik feminin.";
  } else if (text.includes("clean") || text.includes("bersih") || text.includes("sabun") || text.includes("kapas") || text.includes("lembut")) {
    top = "Aldehydes & White Linen";
    middle = "Lily of the Valley & Cotton Blossom";
    base = "Powdery Musk & Cashmere Wood";
    scentName = "Linen Cloud";
    storyAnalysis = "Sentuhan aroma aldehida bersih dan lily lembut membuat Anda merasakan kesegaran murni seperti sprei katun mewah butik bintang lima selepas mandi pagi.";
  }

  return res.json({ top, middle, base, scentName, storyAnalysis });
});

// API 2: Get portfolio list
app.get("/api/portfolio", (req, res) => {
  const db = readDb();
  res.json(db.portfolio);
});

// API 3: Add new portfolio (secured by HoH.2026 check)
app.post("/api/portfolio", (req, res) => {
  const { password, title, image, category } = req.body;
  if (password !== "HoH.2026") {
    return res.status(403).json({ error: "Access denied. Wrong admin password." });
  }
  if (!title || !image) {
    return res.status(400).json({ error: "Title and Image URL are required" });
  }

  const db = readDb();
  const newItem = {
    id: String(Date.now()),
    title: title.trim(),
    image: image.trim(),
    category: category || "standard"
  };
  db.portfolio.unshift(newItem);
  writeDb(db);
  res.json({ success: true, item: newItem });
});

// API 4: Delete portfolio (secured by HoH.2026 check)
app.delete("/api/portfolio/:id", (req, res) => {
  const { password } = req.body;
  const id = req.params.id;
  if (password !== "HoH.2026") {
    return res.status(403).json({ error: "Access denied. Wrong admin password." });
  }

  const db = readDb();
  db.portfolio = db.portfolio.filter((p: any) => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// API 5: Post an Order (and auto manage email-based points)
app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, customerAddress, perfumeName, category, amount, story, moods, engraving, paymentMethod } = req.body;

  if (!customerEmail || !customerName || !perfumeName) {
    return res.status(400).json({ error: "Email, Name, and Perfume Name are required." });
  }

  const db = readDb();
  const orderId = `HIM-INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const date = new Date().toLocaleDateString("id-ID");

  const actualAmount = Number(amount) || 0;
  const newOrder = {
    orderId,
    date,
    customerName,
    customerEmail: customerEmail.toLowerCase().trim(),
    customerAddress: customerAddress || "Ambil Di Tempat (Lab)",
    perfumeName,
    category: category || "standard",
    amount: actualAmount,
    status: "Menunggu Pembayaran",
    moods: Array.isArray(moods) ? moods : [],
    story: story || "",
    engraving: engraving || "",
    paymentMethod: paymentMethod || "Transfer Bank"
  };

  db.orders.unshift(newOrder);

  // Points Calculation Tiers
  // Economic: 10 Pts, Basic: 20 Pts, Standard: 60 Pts, Premium: 150 Pts
  let pointsForThisOrder = 20;
  if (category === "economic") pointsForThisOrder = 10;
  else if (category === "basic") pointsForThisOrder = 20;
  else if (category === "standard") pointsForThisOrder = 60;
  else if (category === "premium") pointsForThisOrder = 150;

  // Manage Membership points
  const emailKey = customerEmail.toLowerCase().trim();
  const existingCustIndex = db.customers.findIndex((c: any) => c.email === emailKey);
  if (existingCustIndex > -1) {
    db.customers[existingCustIndex].points += pointsForThisOrder;
    db.customers[existingCustIndex].totalSpent += actualAmount;
    db.customers[existingCustIndex].lastOrder = date;
    db.customers[existingCustIndex].name = customerName; // keep latest name
  } else {
    db.customers.push({
      email: emailKey,
      name: customerName,
      points: pointsForThisOrder,
      totalSpent: actualAmount,
      lastOrder: date
    });
  }

  // Email invoice simulation - append to log
  const emailId = `e-${Date.now()}`;
  const formattedPrice = actualAmount.toLocaleString("id-ID");
  const emailBody = `
Halo ${customerName},

Terima kasih telah memesan Bespoke Perfume di Himmel Lab.
Berikut adalah rincian Invoice resmi pemesanan Anda:

ID Pesanan: ${orderId}
Nama Parfum: "${perfumeName}"
Kategori Paket: ${category.toUpperCase()}
Total Tagihan: Rp ${formattedPrice}
Metode Pembayaran: ${paymentMethod}
Alamat Pengiriman: ${customerAddress}

[Rincian Karakter Aroma]
Pilihan Nuansa: ${Array.isArray(moods) ? moods.join(", ") : "Umum"}
Cerita Aroma Anda: "${story}"
Ukir Plat Nama Logam (untuk Premium): ${engraving || "-"}

REKENING PEMBAYARAN:
BCA: 8660232321 (Puji Kurnia Andrean)
Silakan kirimkan bukti transfer BCA ke WhatsApp kami: https://wa.me/628886103189

Setiap rupiah pesanan Anda mendukung lab artistik parfum lokal kami. Anda otomatis mendapatkan +${pointsForThisOrder} Poin Member!

Salam Wangi,
Himmel Lab Owner
  `;

  // Log simulated email dispatch
  const newEmail = {
    id: emailId,
    to: emailKey,
    subject: `[INVOICE HIMMEL LAB] ${orderId} - ${perfumeName}`,
    body: emailBody.trim(),
    timestamp: new Date().toISOString()
  };

  db.emails.unshift(newEmail);
  writeDb(db);

  res.json({ success: true, order: newOrder, pointsEarned: pointsForThisOrder });
});

// API 6: Update Order Status (Admin with password)
app.post("/api/orders/status", (req, res) => {
  const { password, orderId, status } = req.body;
  if (password !== "HoH.2026") {
    return res.status(403).json({ error: "Access denied. Wrong admin password." });
  }

  const db = readDb();
  const orderIndex = db.orders.findIndex((o: any) => o.orderId === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  db.orders[orderIndex].status = status;
  writeDb(db);
  res.json({ success: true });
});

// API 7: Checking member by email
app.get("/api/members/:email", (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  const db = readDb();
  
  const customer = db.customers.find((c: any) => c.email === email);
  if (!customer) {
    // If they haven't ordered yet, they have 0 points, return temporary view
    return res.json({ name: "Pengunjung Baru", email, points: 0, totalSpent: 0, lastOrder: "-" });
  }
  res.json(customer);
});

// API 8: Redeem loyalty points
app.post("/api/redeem", (req, res) => {
  const { email, rewardName, pointsNeeded } = req.body;
  if (!email || !rewardName || !pointsNeeded) {
    return res.status(400).json({ error: "Email, reward name, and points cost are required" });
  }

  const db = readDb();
  const emailKey = email.toLowerCase().trim();
  const custIndex = db.customers.findIndex((c: any) => c.email === emailKey);
  
  if (custIndex === -1) {
    return res.status(404).json({ error: "Email member belum terdaftar dalam sistem order." });
  }

  const customer = db.customers[custIndex];
  if (customer.points < pointsNeeded) {
    return res.status(400).json({ error: "Maaf, poin Anda tidak mencukupi untuk melakukan penukaran reward ini." });
  }

  // Deduct points
  db.customers[custIndex].points -= Number(pointsNeeded);

  // Generate voucher token
  const token = `HML-REDEEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const redeemLog = {
    id: `red-${Date.now()}`,
    email: emailKey,
    rewardName,
    pointsSpent: Number(pointsNeeded),
    code: token,
    timestamp: new Date().toLocaleDateString("id-ID")
  };

  db.redeemCodes.unshift(redeemLog);

  // Write notification email for claim code to Admin
  const emailId = `e-${Date.now()}`;
  const emailBodyToCustomer = `
Halo ${customer.name},

Selamat! Penukaran poin loyalty member Anda berhasil.
Rincian Klaim Reward Anda:

Reward: ${rewardName}
Poin Terpotong: ${pointsNeeded} Pts
KODE KLAIM KHUSUS: ${token}

Silakan kirimkan tangkapan layar atau salinan kode ini langsung ke WhatsApp kami di 0888-610-3189 untuk melakukan klaim fisik atau potongan harga jasa.

Terima kasih atas loyalitas Anda terhadap Himmel Lab.

Salam Wangi,
Himmel Lab Owner
  `;

  db.emails.unshift({
    id: emailId,
    to: emailKey,
    subject: `[LOYALTY HIMMEL LAB] Penukaran Reward Sukses - ${token}`,
    body: emailBodyToCustomer.trim(),
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({ status: "success", token, remainingPoints: db.customers[custIndex].points });
});

// API 8.5: Get and update dynamic rewards
app.get("/api/rewards", (req, res) => {
  const db = readDb();
  res.json(db.rewards || []);
});

app.post("/api/rewards", (req, res) => {
  const { password, rewards } = req.body;
  if (password !== "HoH.2026") {
    return res.status(403).json({ error: "Access denied. Wrong admin password." });
  }
  if (!Array.isArray(rewards)) {
    return res.status(400).json({ error: "Rewards must be an array" });
  }
  
  const db = readDb();
  db.rewards = rewards;
  writeDb(db);
  res.json({ status: "success", rewards: db.rewards });
});

// API 9: Forgot Password (Sends password to predefined admin emails)
app.post("/api/forgot-password", (req, res) => {
  const db = readDb();
  const adminEmails = ["pujikurnia.work@gmail.com", "himmelfragrance@gmail.com"];
  const passwordTerdaftar = "HoH.2026";

  const emailBody = `
Peringatan Keamanan Himmel Lab,

Seseorang baru saja mendeteksi fitur 'Lupa Password' dari Halaman Owner / Admin Login Portal pada ${new Date().toISOString()}.

Kredensial Akses Berwenang Anda:
==============================
Sandi Dashboard Admin: ${passwordTerdaftar}
==============================

Jika Anda atau rekan Anda yang meminta hal ini, abaikan email peringatan ini. Jika ini bukan tindakan Anda, disarankan untuk memantau logs database lab secara berkala.

Salam Wangi & Keamanan,
Himmel Lab System Engine Autopilot
  `;

  // We append email history for each admin
  adminEmails.forEach((emailAddress) => {
    db.emails.unshift({
      id: `e-pwd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: emailAddress,
      subject: "ALERT: Himmel Lab Admin Password Recovery",
      body: emailBody.trim(),
      timestamp: new Date().toISOString()
    });
  });

  writeDb(db);
  res.json({ success: true, message: "Kredensial sandi administrator telah disimulasikan terkirim ke alamat email Puji Kurnia." });
});

// API 10: Get general database of customers & orders & email logs (secured by HoH.2026 password checking)
app.post("/api/admin/data", (req, res) => {
  const { password } = req.body;
  if (password !== "HoH.2026") {
    return res.status(403).json({ error: "Access denied. Wrong admin password." });
  }

  const db = readDb();
  res.json({
    customers: db.customers,
    orders: db.orders,
    redeemCodes: db.redeemCodes,
    emails: db.emails,
    rewards: db.rewards || []
  });
});

// API 11: Demo Mail server log peek (Let dev and user see real emitted invoices/reset alert in browser!)
app.get("/api/admin/email-logs", (req, res) => {
  const db = readDb();
  res.json(db.emails || []);
});

// Vite middleware for development / static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HIMMEL LAB SERVER] Running on port http://localhost:${PORT}`);
  });
}

startServer();
