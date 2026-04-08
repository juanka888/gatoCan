import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    // 1. Intentamos obtener la sesión del servidor
    const sessionAuth = await getServerSession(authOptions);
    const { name, amount, userId } = await req.json();

    // 2. Lógica de identidad para el Webhook (Karma)
    const finalUserEmail = sessionAuth?.user?.email || (userId !== "anonymous" ? userId : "anonymous");

    // 3. Definimos la URL base y la redirección inteligente
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL;
    
    // Si hay sesión real, va al perfil; si no, vuelve a la home con el parámetro "thanks"
    const successRedirect = sessionAuth 
      ? `${baseUrl}/perfil?success=true` 
      : `${baseUrl}/?thanks=true`;

    // 4. Creación de la sesión de Stripe
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
      metadata: {
        userEmail: finalUserEmail,
        karmaPoints: amount.toString(),
        catName: name
      },
      success_url: successRedirect,
      cancel_url: `${baseUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}