import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err: any) {
    console.error(`❌ Error de firma: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userEmail = session.metadata?.userEmail;
    const pointsToAdd = Number(session.metadata?.karmaPoints || 0);
    const animalName = session.metadata?.animalName || "Donación GatoCan";
    const amountInEuros = session.amount_total ? session.amount_total / 100 : 0;

    try {
      let userId: string | null = null;

      if (userEmail && userEmail !== "anonymous") {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (user) {
          userId = user.id;
          await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
              karmaPoints: { increment: pointsToAdd },
              totalDonaciones: { increment: amountInEuros },
            },
            create: {
              userId: user.id,
              email: user.email,
              karmaPoints: pointsToAdd,
              totalDonaciones: amountInEuros,
              aceptaPoliticas: true,
            },
          });
        }
      }

      await prisma.donation.create({
        data: {
          amount: amountInEuros,
          animalName,
          userId,
        },
      });

      console.log(`✅ Registro completado: ${amountInEuros}€ para ${animalName}`);
    } catch (error) {
      console.error("❌ Error en DB:", error);
    }
  }

  return NextResponse.json({ received: true });
}
