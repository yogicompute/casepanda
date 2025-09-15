"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/Products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order, shippingAddress } from "@prisma/client";
import Razorpay from "razorpay";
import { type Address } from "@/components/address-dropdown";

export const createCheckoutSession = async ({
	configId,
	address,
}: {
	configId: string;
	address: Address;
}) => {
	const configuration = await db.configuration.findUnique({
		where: { id: configId },
	});

	if (!configuration) {
		throw new Error("No such configuration found");
	}

	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
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
			userId: user.id,
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
				userId: user.id,
				configurationId: configuration.id,
				shippingAddressId: address.id,
			},
		});
	}

	// 4. create Razorpay order with your order.id as the receipt
	const razorpay = new Razorpay({
		key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
		key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
	});

	const razorpayOrder = await razorpay.orders.create({
		amount: price * 100, // in paisa
		currency: "INR",
		receipt: "rcp1", // your own orderId goes here
		notes:{orderId: order.id}
	});

	return {
		orderId: order.id, // 🔑 your DB orderId
		razorpayOrderId: razorpayOrder.id, // only needed for checkout widget
	};
};
