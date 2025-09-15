import { db } from "@/db";
import crypto from "crypto";

// Deprecated page config replaced by runtime
export const runtime = "nodejs"; // keep it node if you need crypto or database access

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    console.log("\n\n\nWEBHOOK CALLED\n\n\n");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
        .createHmac("sha256", secret!)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 400,
        });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
        console.log("Payment captured:", event.payload.payment.entity.id);
    }

    console.log("Full payload:", JSON.stringify(event, null, 2));

    if (event.event === "order.paid") {
        try {
            await db.order.update({
                where: {
                    id: event.payload.payment.entity.notes.orderId,
                },
                data: {
                    isPaid: true,
                },
            });
        } catch (error) {
            throw new Error("not updated");
        }
    }

    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}
