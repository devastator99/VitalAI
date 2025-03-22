"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { internal } from "./_generated/api";
// import Constants from 'expo-constants';

// Initialize Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// /**
//  * Creates a new order with Razorpay and stores it in the Convex database.
//  * @param {number} amount - The order amount in the smallest currency unit (e.g., paise for INR).
//  * @returns {string} - The Razorpay order ID.
//  * @throws {Error} - If the amount is invalid or order creation fails.
//  */
export const createOrder = action({
  args: {
    amount: v.number(), // Amount in smallest currency unit (e.g., 50000 paise = ₹500)
  },
  handler: async (ctx, args) => {
    const { amount } = args;

    // Validate that amount is a positive integer
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Amount must be a positive integer.");
    }

    // Razorpay order options
    const options = {
      amount: amount,           // Amount in paise
      currency: "INR",          // Currency code
      receipt: `receipt_${Date.now()}`, // Unique receipt ID (consider UUID for high concurrency)
    };

    try {
      // Create order with Razorpay
      const order = await razorpay.orders.create(options);
      const orderId = order.id;

      console.log(orderId)

      // Store order details in Convex database
      await ctx.runMutation(internal.orders.insertData, {
        orderId : orderId,
        amount: amount
      });

      // Return the order ID to the frontend
      return orderId;
    } catch (error:any) {
      throw new Error(`Order creation failed: ${error.message}`);
    }
  },
});



// /**
//  * Verifies a payment using Razorpay's signature and updates the order status if valid.
//  * @param {string} orderId - The Razorpay order ID.
//  * @param {string} paymentId - The Razorpay payment ID.
//  * @param {string} signature - The signature from Razorpay for verification.
//  * @returns {boolean} - Whether the payment verification succeeded.
//  * @throws {Error} - If verification fails or the order is not found.
//  */
export const verifyPayment = action({
  args: {
    orderId: v.string(),    // Razorpay order ID
    paymentId: v.string(),  // Razorpay payment ID
    signature: v.string(),  // Signature from Razorpay
  },
  handler: async (ctx, args) => {
    const { orderId, paymentId, signature } = args;
    const secret = process.env.RAZORPAY_KEY_SECRET; 


    try {
      // Verify payment signature using Razorpay utility
      const isValid = validatePaymentVerification(
        { order_id: orderId, payment_id: paymentId },
        signature,
        secret!
      );

      if (isValid) {
        // Find the order in the database using the index
        const order = await ctx.runMutation(internal.orders.verifyDrill, {
            orderId : orderId
          });
      }

      return isValid;
    } catch (error:any) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  },
});


export const getCheckoutPage = action({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const order:any = await ctx.runQuery(internal.orders.get, { orderId });
    if (!order) throw new Error("Order not found");
    
    return `
      <html>
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            const options = {
              key: "${process.env.RAZORPAY_KEY_ID}",
              amount: "${order.amount}",
              currency: "INR",
              order_id: "${order.orderId}",
              handler: function(response) {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    status: 'success',
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature
                  })
                );
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(
                    JSON.stringify({ status: 'closed' })
                  );
                }
              }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
          </script>
        </body>
      </html>
    `;
  }
});