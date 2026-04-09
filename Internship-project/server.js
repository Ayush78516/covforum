import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import qs from "querystring";
import connectDB from "./config/db.js";
import "./config/redis.js";
import { encrypt, decrypt } from "./ccavutil.js";
import contactRoutes from "./routes/contacts.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import paymentRoutes from "./routes/payment.js";
import errorHandler from "./middleware/error.js";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
let BASE_URL = process.env.BASE_URL || "http://localhost:3000";
if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = "http://" + BASE_URL;
}

// CCAvenue payment URL — test vs production based on env
const CCAV_URL = process.env.CCAVENUE_ENV === "production"
  ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

connectDB();

app.use(cors({ origin: BASE_URL }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);

// ── CCAvenue Request Handler ──
// Receives order data from frontend, encrypts it, auto-submits to CCAvenue
app.post("/ccavRequestHandler", (req, res) => {
  try {
    const body = qs.stringify(req.body);
    console.log("CCAvenue request body:", body);

    const encRequest = encrypt(body, WORKING_KEY);
    console.log("Encrypted request length:", encRequest.length);

    // Return HTML form that auto-submits to CCAvenue — standard kit pattern
    const formBody = `
      <html><body>
      <center><p>Please wait... redirecting to payment gateway.</p></center>
      <form id="nonseamless" method="post" name="redirect" action="${CCAV_URL}">
        <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" id="access_code" value="${ACCESS_CODE}">
        <script language="javascript">document.redirect.submit();</script>
      </form>
      </body></html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(formBody);

  } catch (err) {
    console.error("ccavRequestHandler error:", err.message);
    res.status(500).send("Payment initiation failed: " + err.message);
  }
});

// ── CCAvenue Response Handler ──
// CCAvenue posts encrypted response here after payment
app.post("/ccavResponseHandler", (req, res) => {
  try {
    const encResp = req.body.encResp;

    if (!encResp) {
      console.error("No encResp received");
      return res.redirect(`${BASE_URL}/payment-status?status=failed`);
    }

    const ccavResponse = decrypt(encResp, WORKING_KEY);
    console.log("Decrypted CCAvenue response:", ccavResponse);

    // Parse response string into object
    const params = {};
    ccavResponse.split("&").forEach(pair => {
      const [k, ...v] = pair.split("=");
      if (k) params[k.trim()] = v.join("=").trim();
    });

    const status = params["order_status"];
    const orderId = params["order_id"];
    const amount = params["amount"];
    const trackingId = params["tracking_id"];
    const bankRefNo = params["bank_ref_no"];
    const failureMsg = params["failure_message"];
    const membershipNo = params["merchant_param2"];
    const memberType = params["merchant_param3"];
    const memberClass = params["merchant_param4"];
    const validTill = params["merchant_param5"];
    const paymentMode = params["payment_mode"];

    console.log("Payment status:", status, "| Order:", orderId, "| Amount:", amount);

    if (status === "Success") {
      // Save payment to this server's own endpoint
      fetch(`http://localhost:${PORT}/api/payment/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId, trackingId, bankRefNo, amount,
          memberType, memberClass, membershipNo, validTill,
          paymentMode, status: "Success",
          paidAt: new Date().toISOString(),
          merchantParam1: params["merchant_param1"],
        }),
      }).catch(err => console.error("Failed to save payment:", err.message));

      const receiptData = encodeURIComponent(JSON.stringify({
        orderId, trackingId, bankRefNo, amount,
        memberType, memberClass, membershipNo, validTill,
        paymentMode, status: "Success",
        paidAt: new Date().toISOString(),
      }));

      return res.redirect(
        `${BASE_URL}/payment-status?status=success&data=${receiptData}`
      );

    } else if (status === "Aborted") {
      return res.redirect(
        `${BASE_URL}/payment-status?status=aborted&orderId=${orderId}`
      );

    } else {
      return res.redirect(
        `${BASE_URL}/payment-status?status=failed&orderId=${orderId}&reason=${encodeURIComponent(failureMsg || "Payment failed")}`
      );
    }

  } catch (err) {
    console.error("ccavResponseHandler error:", err.message);
    return res.redirect(`${BASE_URL}/payment-status?status=failed`);
  }
});

// ── Vite Middleware Integration (Unification) ──
const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: path.join(__dirname, "../front"), // Point to the frontend folder
  });
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
} else {
  // Production: Serve static files from front/dist
  const distPath = path.join(__dirname, "../front/dist");
  app.use(express.static(distPath));
  app.get("*path", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ccav")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`CCAvenue env: ${process.env.CCAVENUE_ENV || "test"}`);
});