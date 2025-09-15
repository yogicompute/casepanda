import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User Id is required." },
				{ status: 400 }
			);
		}

		const res = await db.shippingAddress.findMany({ where: { userId } });
		return NextResponse.json({ res });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { userId, shippingAddress } = body;

		console.log("[POST ADDRESS BODY] : ", body);

		if (!userId || !shippingAddress) {
			return NextResponse.json(
				{ error: "userId and shippingAddress are required" },
				{ status: 400 }
			);
		}

		const created = await db.shippingAddress.create({
			data: { ...shippingAddress, userId },
		});
		await db.billingAddress.create({
			data: {
				...shippingAddress,
				userId,
			},
		});

		return NextResponse.json(created, { status: 201 });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
