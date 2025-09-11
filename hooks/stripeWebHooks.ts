import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
// import { buffer } from "micro";

// Supabase client setup using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// IMPORTANT: This is required for Next.js 13+ to parse the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  // Use the raw body to verify the webhook signature
//   const buf = await buffer(req);
//   const sig = req.headers.get("stripe-signature");

//   if (!sig || !stripeWebhookSecret) {
//     return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });
//   }

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, stripeWebhookSecret);
//   } catch (err: any) {
//     console.error(`Webhook signature verification failed: ${err.message}`);
//     return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
//   }

//   // Handle the event
//   switch (event.type) {
//     case "checkout.session.completed":
//       const session = event.data.object as Stripe.Checkout.Session;
      
//       try {
//         // Retrieve the user email from the metadata
//         const userEmail = session.metadata?.userEmail;
//         if (!userEmail) {
//           console.error("Missing userEmail in Stripe session metadata");
//           break; // Stop processing this event
//         }
        
//         // Insert payment details into your Supabase table
//         const { error } = await supabase.from("payments").insert({
//           stripe_session_id: session.id,
//           email: userEmail,
//           amount: session.amount_total,
//           currency: session.currency,
//           mode: session.mode,
//           // Add other relevant data you need to save
//         });

//         if (error) {
//           console.error("Supabase insert error:", error);
//           // You might want to retry this later or send an alert
//         }
//       } catch (err) {
//         console.error("Supabase operation failed:", err);
//       }
//       break;

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

  // Return a 200 to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
