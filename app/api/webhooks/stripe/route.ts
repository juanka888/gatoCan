import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // ARREGLO AQUÍ: Añadimos el await para que headersList deje de ser una Promesa
  const headersList = await headers(); 
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Error de firma: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userEmail = session.metadata?.userEmail;
    const pointsToAdd = Number(session.metadata?.karmaPoints || 0);
    const amountInEuros = session.amount_total ? session.amount_total / 100 : 0;

    if (userEmail && pointsToAdd > 0) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (user) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: {
              karmaPoints: { increment: pointsToAdd },
              totalDonaciones: { increment: amountInEuros },
            },
          });
          console.log(`✅ ${pointsToAdd} puntos añadidos a ${userEmail}`);
        }
      } catch (error) {
        console.error("❌ Error al actualizar DB:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}