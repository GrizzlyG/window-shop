import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This webhook endpoint is disabled as Stripe is no longer used
  // The application now uses a mock payment system
  
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Return success to prevent webhook retry loops if Stripe still tries to send events
  return res.status(200).json({ 
    received: true,
    message: "Stripe webhooks are no longer processed. Using mock payment system."
  });
}

    default:
      console.log("Unhandled event type: " + event.type);
  }

  res.json({ received: true });
}
