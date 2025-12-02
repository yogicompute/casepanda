"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("You need to be logged in to view this page");
  }
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  console.log(order)
  if (!order) {
    throw new Error("The order does not exits");
  }
  if (order.isPaid) {
    return order;
  } else {
    return false;
  }
};
