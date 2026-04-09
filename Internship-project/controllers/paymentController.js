import User from "../models/User.js";

// Fee Map
const FEE_MAP = {
  Monthly:       process.env.FEE_MONTHLY       || "500",
  Quarterly:     process.env.FEE_QUARTERLY     || "1200",
  Annual:        process.env.FEE_ANNUAL        || "3000",
  Life:          process.env.FEE_LIFE          || "10000",
  Institutional: process.env.FEE_INSTITUTIONAL || "25000",
};

// GET /api/payment/initiate-data
// Frontend calls this to get all order data to POST to ccavServer
export const getPaymentData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const memberType  = user.memberDetails?.memberType  || "Annual";
    const memberClass = user.memberDetails?.memberClass || "";
    const validTill   = user.memberDetails?.validTill   || "";
    const amount      = FEE_MAP[memberType] || "1000";
    const orderId     = `COV${Date.now()}${req.user.id.toString().slice(-4)}`;

    // redirect_url and cancel_url point to the main server's CCAvenue handler
    let backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = "http://" + backendUrl;
    }

    return res.json({
      success: true,
      formData: {
        merchant_id:         process.env.CCAVENUE_MERCHANT_ID,
        order_id:            orderId,
        currency:            "INR",
        amount:              amount,
        redirect_url:        `${backendUrl}/ccavResponseHandler`,
        cancel_url:          `${backendUrl}/ccavResponseHandler`,
        language:            "EN",
        billing_name:        `${user.firstName} ${user.lastName}`,
        billing_address:     user.permAddress?.line1 || "NA",
        billing_city:        user.permAddress?.city  || "NA",
        billing_state:       user.permAddress?.state || "NA",
        billing_zip:         user.permAddress?.pincode || "000000",
        billing_country:     "India",
        billing_tel:         user.personal?.mobile || user.phone || "9999999999",
        billing_email:       user.email,
        delivery_name:       `${user.firstName} ${user.lastName}`,
        delivery_address:    user.permAddress?.line1 || "NA",
        delivery_city:       user.permAddress?.city  || "NA",
        delivery_state:      user.permAddress?.state || "NA",
        delivery_zip:        user.permAddress?.pincode || "000000",
        delivery_country:    "India",
        delivery_tel:        user.personal?.mobile || user.phone || "9999999999",
        merchant_param1:     req.user.id.toString(),
        merchant_param2:     user.tempMembershipId || "",
        merchant_param3:     memberType,
        merchant_param4:     memberClass,
        merchant_param5:     validTill,
        promo_code:          "",
        customer_identifier: user.email,
      },
      ccavRequestUrl: `${backendUrl}/ccavRequestHandler`,
      amount,
      memberType,
      orderId,
    });

  } catch (err) {
    console.error("getPaymentData error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/save
// Called by ccavServer after successful payment to save record
export const savePayment = async (req, res) => {
  try {
    const {
      orderId, trackingId, bankRefNo, amount,
      memberType, memberClass, membershipNo, validTill,
      paymentMode, status, paidAt, merchantParam1,
    } = req.body;

    if (!merchantParam1) return res.status(400).json({ success: false, message: "No user ID" });

    await User.findByIdAndUpdate(merchantParam1, {
      $push: {
        payments: {
          orderId, trackingId, bankRefNo, amount,
          memberType, memberClass, membershipNo, validTill,
          paymentMode, status: status || "Success",
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        }
      }
    });

    console.log("Payment saved for user:", merchantParam1, "| Order:", orderId);
    return res.json({ success: true, message: "Payment saved" });

  } catch (err) {
    console.error("savePayment error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};