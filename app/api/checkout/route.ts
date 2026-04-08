// checkout/route.ts (Corregido para permitir anónimos)
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    // Intentamos obtener la sesión, pero NO bloqueamos si no existe
    const sessionAuth = await getServerSession(authOptions);
    const { name, amount, userId } = await req.json();

    // Lógica de identidad: 
    // Prioridad 1: Sesión del servidor
    // Prioridad 2: userId enviado desde el cliente (si es "anonymous" o email)
    // Prioridad 3: "anonymous" por defecto
    const finalUserEmail = sessionAuth?.user?.email || (userId !== "anonymous" ? userId : "anonymous");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: `Donación: ${name}`,
              description: "Gracias por apoyar a GatoCan Natura Rural"
            },
            unit_amount: amount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // METADATOS: Aquí guardamos la info para el Webhook
      metadata: {
        userEmail: finalUserEmail, // Aquí irá el email real o "anonymous"
        karmaPoints: amount.toString(),
        catName: name
      },
      // Cambiamos NEXT_PUBLIC_URL por NEXTAUTH_URL si es necesario, 
      // pero asegúrate de que tus variables de entorno coincidan
      success_url: `${process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL}/perfil?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}