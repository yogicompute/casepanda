"use client";
import Confetti from "react-dom-confetti";
import Script from "next/script";
import { useState, useEffect } from "react";
import { LoginModal, Phone } from "@/components";
import { Configuration } from "@prisma/client";
import { COLORS, FINISHES, MODELS } from "@/validators/option-validator";
import { cn, formatPrice } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/Products";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { createCheckoutSession } from "./actions";
import { AddressDropdown, type Address } from "@/components/address-dropdown";

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
	const router = useRouter();
	const { id } = configuration;
	const { user, isLoading } = useKindeBrowserClient();
	const { toast } = useToast();

	const [showConfetti, setShowConfetti] = useState<boolean>(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem("configurationId", id);
			setIsLoginModalOpen(true);
		}
		setShowConfetti(true);
	}, [user]);

	const { color, model, finish, material } = configuration;
	const tw = COLORS.find((c) => c.value === color)?.tw;

	const { label: modelLabel } = MODELS.options.find(
		({ value }) => value === model
	)!;

	let totalPrice = BASE_PRICE;
	if (material === "polycarbonate")
		totalPrice += PRODUCT_PRICES.material.polycarbonate;
	if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured;

	const [shippingAddress, setShippingAddress] = useState<Address | null>(
		null
	);
	const handleShippingAddressChange = (address: Address | null) => {
		setShippingAddress(address);
	};

	const handleCheckout = async () => {
		if (!shippingAddress) {
			toast({ title: "Please select a shipping address" });
			return;
		}

		if (user) {
			const { orderId, razorpayOrderId } = await createCheckoutSession({
				configId: configuration.id,
				address: shippingAddress,
			});

			const options = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount: parseFloat(String(totalPrice)) * 100,
				currency: "INR",
				name: "name", // TODO: Replace
				description: "description", // TODO: Replace
				order_id: razorpayOrderId,
				handler: async function (response: any) {
					const data = {
						orderCreationId: razorpayOrderId,
						razorpayPaymentId: response.razorpay_payment_id,
						razorpayOrderId: response.razorpay_order_id,
						razorpaySignature: response.razorpay_signature,
					};

					const result = await fetch("/api/verify", {
						method: "POST",
						body: JSON.stringify(data),
						headers: { "Content-Type": "application/json" },
					});
					const res = await result.json();
					if (res.isOk) {
						toast({ title: "Payment Successful." });
						router.push(
							`${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${orderId}`
						);
					} else {
						toast({
							title: "Something went wrong",
							description: "We couldn't verify the payment.",
						});
					}
				},
				prefill: {
					email: user.email,
				},
				theme: {
					color: "#3399cc", // TODO: Customize
				},
			};

			// @ts-ignore
			const paymentObject = new window.Razorpay(options);
			paymentObject.on("payment.failed", function (response: any) {
				alert(response.error.description);
			});
			paymentObject.open();
		} else {
			// Need to log in
			localStorage.setItem("configurationId", id);
			setIsLoginModalOpen(true);
		}
	};

	return (
		<>
			<Script
				id="razorpay-checkout-js"
				src="https://checkout.razorpay.com/v1/checkout.js"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center">
				<Confetti
					active={showConfetti}
					config={{ elementCount: 200, spread: 90, angle: 90 }}
				/>
			</div>

			<LoginModal
				isOpen={isLoginModalOpen}
				setIsOpen={setIsLoginModalOpen}
			/>

			<div className="mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
				<div className="md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2">
					<Phone
						className={cn(
							`bg-${tw}`,
							"max-w-[150px] md:max-w-full"
						)}
						imgSrc={configuration.croppedImageUrl!}
					/>
				</div>
				<div className="mt-6 sm:col-span-9  md:row-end-1">
					<h3 className="text-3xl font-bold tracking-tight text-gray-900">
						Your {modelLabel} Case
					</h3>
					<div className="mt-3 flex items-center gap-1.5 text-base">
						<Check className="h-4 w-4 text-green-500" />
						In stock and ready to ship
					</div>
				</div>

				<div className="sm:col-span-12 md:col-span-9 text-base">
					{/* Highlights */}
					<div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
						<div>
							<p className="font-medium text-zinc-950">
								Highlights
							</p>
							<ol className="mt-3 text-zinc-700 list-disc list-inside">
								<li>Wireless charging compatible</li>
								<li>TPU shock absorption</li>
								<li>5 years print guarantee</li>
								<li>
									Packaged with love 💗 using recycled
									materials
								</li>
							</ol>
						</div>
						<div>
							<p className="font-medium text-zinc-950">
								Materials
							</p>
							<ol className="mt-3 text-zinc-700 list-disc list-inside">
								<li>High quality durable material</li>
								<li>
									Scratch and fingerprint resistance coating
								</li>
							</ol>
						</div>
					</div>

					{/* Shipping Address */}
					{user && (
						<div className="space-y-6 mt-8">
							<div className="space-y-2">
								<label className="text-sm font-medium">
									Shipping Address
								</label>
								<AddressDropdown
									onAddressSelect={
										handleShippingAddressChange
									}
									userId={user.id}
								/>
							</div>
						</div>
					)}

					{/* Pricing Summary */}
					<div className="mt-8">
						<div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
							<div className="flow-root text-sm">
								<div className="flex items-center justify-between py-1 mt-2">
									<p className="text-gray-600">Base price</p>
									<p className="font-medium text-gray-900">
										{formatPrice(BASE_PRICE)}
									</p>
								</div>
								{finish === "textured" && (
									<div className="flex items-center justify-between py-1 mt-2">
										<p className="text-gray-600">
											Textured finish
										</p>
										<p className="font-medium text-gray-900">
											{formatPrice(
												PRODUCT_PRICES.finish.textured
											)}
										</p>
									</div>
								)}
								{material === "polycarbonate" && (
									<div className="flex items-center justify-between py-1 mt-2">
										<p className="text-gray-600">
											Soft polycarbonate material
										</p>
										<p className="font-medium text-gray-900">
											{formatPrice(
												PRODUCT_PRICES.material
													.polycarbonate
											)}
										</p>
									</div>
								)}
								<div className="my-2 h-px bg-gray-200" />
								<div className="flex items-center justify-between py-2">
									<p className="font-semibold text-gray-900">
										Order Total
									</p>
									<p className="font-semibold text-gray-900">
										{formatPrice(totalPrice)}
									</p>
								</div>
							</div>
						</div>

						{/* Checkout Button */}
						<div className="mt-8 flex justify-end pb-12">
							<Button
								onClick={handleCheckout}
								className="px-4 sm:px-6 lg:px-8">
								Check out{" "}
								<ArrowRight className="h-4 w-4 ml-1.5 inline" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DesignPreview;
