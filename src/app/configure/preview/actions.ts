"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/Products";
import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { Order } from "@prisma/client";
import { stripe } from "@/lib/stripe";

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("No such configuration found");
  }

  const { userId } = auth();

  if (!userId) {
    throw new Error("You need to be logged in");
  }

  // 1. calculate price
  const { finish, material } = configuration;
  let price = BASE_PRICE;
  if (finish === "textured") price += PRODUCT_PRICES.finish.textured;
  if (material === "polycarbonate")
    price += PRODUCT_PRICES.material.polycarbonate;

  // 2. Check for existing order
  let order: Order | undefined = undefined;

  const existingOrder = await db.order.findFirst({
    where: {
      userId,
      configurationId: configuration.id,
    },
  });

  // 3. create/update order in DB (this is your source of truth)
  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await db.order.create({
      data: {
        amount: price, // store in rupees, since your schema uses Float
        userId,
        configurationId: configuration.id,
      },
    });
  }

  // 4. create stripe order with your order.id as the receipt
  const product = await stripe.products.create({
    name: "Custom iPhone Case",
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "INR",
      unit_amount: price*100,
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["IN"] },
	metadata:{
		userId: userId,
		orderId: order.id
	},
	line_items:[{price:product.default_price as string, quantity: 1}]
  });

  return {url: stripeSession.url}
};
