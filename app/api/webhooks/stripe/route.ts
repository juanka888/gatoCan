import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // SOLUCIÓN AL ERROR ROJO (image_5ff299.png): 
  // En Next.js 15 headers() es asíncrono. Añadimos await.
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
    const animalName = session.metadata?.animalName || "Gatito";
    const amountInEuros = session.amount_total ? session.amount_total / 100 : 0;

    try {
      let userId: string | null = null;

      // 1. Buscamos usuario para asignar Karma (si no es anónimo)
      if (userEmail && userEmail !== "anonymous") {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (user) {
          userId = user.id;
          await prisma.profile.update({
            where: { userId: user.id },
            data: {
              karmaPoints: { increment: pointsToAdd },
              totalDonaciones: { increment: amountInEuros },
            },
          });
        }
      }

      // 2. REGISTRO DE DONACIÓN (Anónima o Registrada)
      // Nota: El error rojo en 'donation' desaparecerá al ejecutar el comando de abajo
      await (prisma as any).donation.create({
        data: {
          amount: amountInEuros,
          animalName: animalName,
          userId: userId, 
        },
      });

      console.log(`✅ Registro completado: ${amountInEuros}€ para ${animalName}`);

    } catch (error) {
      console.error("❌ Error en DB:", error);
    }
  }

  return NextResponse.json({ received: true });
}