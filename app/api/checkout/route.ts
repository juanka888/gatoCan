import { NextResponse } from "next/server";
const Stripe = require("stripe"); // Usamos require para evitar el error de tipo/valor

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { name, amount } = await req.json();

    // Validación básica
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "El importe debe ser mayor a 0" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: name },
            unit_amount: Math.round(amount * 100), // Usamos Math.round por seguridad con decimales
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Usamos la variable de entorno para que funcione en local y en producción
      success_url: `${process.env.NEXT_PUBLIC_URL}/perfil?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/perfil`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error Stripe:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}