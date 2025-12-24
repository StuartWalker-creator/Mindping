import express from "express";
import Stripe from "stripe";
import cors from "cors";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4000;

app.use(cors())
// ---------- Helpers ----------
const PURCHASE_FILE = "./purchases.json";

function readPurchases() {
  return JSON.parse(fs.readFileSync(PURCHASE_FILE, "utf8"));
}

function writePurchases(data) {
  fs.writeFileSync(PURCHASE_FILE, JSON.stringify(data, null, 2));
}

// ---------- Static ----------
app.use(express.static("../public"));
app.use(express.json());

// ---------- Create Checkout ----------
app.post("/create-checkout-session", async (req, res) => {
  const token = uuidv4();
  
  const purchases = readPurchases();
  purchases[token] = { paid: false, createdAt: new Date().toISOString() };
  writePurchases(purchases);
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    metadata: { token },
    success_url: `${req.headers.origin}/success.html?token=${token}`,
    cancel_url: `${req.headers.origin}/today.html`,
  });
  
  res.json({ url: session.url });
});

// ---------- Verify Purchase ----------
app.get("/verify-purchase", (req, res) => {
  const { token } = req.query;
  if (!token) return res.json({ paid: false });
  
  const purchases = readPurchases();
  res.json({ paid: purchases[token]?.paid === true });
});

// ---------- Stripe Webhook ----------
/*app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const token = session.metadata.token;
      
      const purchases = readPurchases();
      if (purchases[token]) {
        purchases[token].paid = true;
        writePurchases(purchases);
      }
    }
    
    res.json({ received: true });
  }
);*/

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);