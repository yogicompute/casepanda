import Razorpay from "razorpay";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/Products";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
	key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
});

export async function POST(request: NextRequest) {
	const { amount, currency, configId } = (await request.json()) as {
		amount: string;
		currency: string;
		configId: string;
	};

	const configuration = await db.configuration.findUnique({
		where: {
			id: configId,
		},
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

	const order = await db.order.create({
		data: {
			amount: price / 100,
			userId: user.id,
			configurationId: configuration.id,
		},
	});

	var options = {
		amount: amount,
		currency: currency,
		receipt: "rcp1",
	};
	const RazorPayOrder = await razorpay.orders.create(options);
	console.log(order);
	return NextResponse.json(
		{ orderId: order.id, RazorPayOrderId: RazorPayOrder.id },
		{ status: 200 }
	);
}
