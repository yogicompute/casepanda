import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
	req: NextRequest,
	{ params }: { params: { addressId: string } }
) {
	const { addressId } = params;
	const address = await db.shippingAddress.findUnique({
		where: { id: addressId },
	});
	if (!address)
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(address);
}
export async function PUT(
	req: NextRequest,
	{ params }: { params: { addressId: string } }
) {
	try {
		const { addressId } = params;
		const body = await req.json();
		const updated = await db.shippingAddress.update({
			where: { id: addressId },
			data: body,
		});
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
}
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { addressId: string } }
) {
	try {
		const { addressId } = params;

		const deleted = await db.shippingAddress.delete({
			where: { id: addressId },
		});
		return NextResponse.json({ message: "Deleted successfully", deleted });
	} catch {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
}
