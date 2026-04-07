import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, amount } = await req.json();

    if (!name || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userEmail: sessionAuth.user.email,
        karmaPoints: amount.toString(),
        animalName: name,
      },
      success_url: `${baseUrl}/perfil?success=true`,
      cancel_url: `${baseUrl}/?cancel=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
