// ── CCAvenue Integration Server ──
// Runs on port 3001 alongside your main server (port 3000)
// Based exactly on NodeJS_Integration_Kit/AES-128/nonseamless/
// Run with: node ccavServer.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import { encrypt, decrypt } from "./ccavutil.js";
import qs from "querystring";

const app = express();

// Allow requests from Vite dev proxy (localhost:5173) and any CCAvenue redirect
app.use(cors({
  origin: [
    process.env.BASE_URL || "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
let BASE_URL = process.env.BASE_URL || "http://localhost:3000";
if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = "http://" + BASE_URL;
}

// CCAvenue payment URL — test vs production based on env
const CCAV_URL = process.env.CCAVENUE_ENV === "production"
  ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

// ── POST /ccavRequestHandler ──
// Receives order data from frontend, encrypts it, auto-submits to CCAvenue
app.post("/ccavRequestHandler", (req, res) => {
  try {
    // Build param string from request body — same as kit
    const body = qs.stringify(req.body);
    console.log("CCAvenue request body:", body);

    const encRequest = encrypt(body, WORKING_KEY);
    console.log("Encrypted request length:", encRequest.length);

    // Return HTML form that auto-submits to CCAvenue — exact kit pattern
    const formBody = `
      <form id="nonseamless" method="post" name="redirect" action="${CCAV_URL}">
        <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" id="access_code" value="${ACCESS_CODE}">
        <script language="javascript">document.redirect.submit();</script>
      </form>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(formBody);

  } catch (err) {
    console.error("ccavRequestHandler error:", err.message);
    res.status(500).send("Payment initiation failed: " + err.message);
  }
});

// ── POST /ccavResponseHandler ──
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
      // Save payment to main backend
      fetch(`${process.env.BASE_URL || "http://localhost:3000"}/api/payment/save`, {
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

app.listen(3001, () => {
  console.log(`CCAvenue server running at http://localhost:3001`);
  console.log(`Merchant ID: ${MERCHANT_ID}`);
  console.log(`Environment: ${process.env.CCAVENUE_ENV || "test"}`);
  console.log(`CCAvenue URL: ${CCAV_URL}`);
});