"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Address } from "./address-dropdown";

interface AddressFormProps {
	onSubmit: (address: Omit<Address, "id">) => void;
	onCancel: () => void;
	initialData?: Partial<Address>;
	isEditing?: boolean;
}

export function AddressForm({
	onSubmit,
	onCancel,
	initialData,
	isEditing = false,
}: AddressFormProps) {
	const [formData, setFormData] = useState({
		name: initialData?.name || "",
		street: initialData?.street || "",
		city: initialData?.city || "",
		postalCode: initialData?.postalCode || "",
		country: initialData?.country || "",
		state: initialData?.state || "",
		phoneNumber: initialData?.phoneNumber || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		// Required field validation
		if (!formData.name.trim()) {
			newErrors.name = "Full name is required";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters long";
		}

		if (!formData.street.trim()) {
			newErrors.street = "Street address is required";
		} else if (formData.street.trim().length < 5) {
			newErrors.street =
				"Street address must be at least 5 characters long";
		}

		if (!formData.city.trim()) {
			newErrors.city = "City is required";
		} else if (formData.city.trim().length < 2) {
			newErrors.city = "City must be at least 2 characters long";
		}

		if (!formData.postalCode.trim()) {
			newErrors.postalCode = "Postal code is required";
		} else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(formData.postalCode.trim())) {
			newErrors.postalCode = "Please enter a valid postal code";
		}

		if (!formData.country.trim()) {
			newErrors.country = "Country is required";
		} else if (formData.country.trim().length < 2) {
			newErrors.country = "Country must be at least 2 characters long";
		}

		// Optional field validation
		if (
			formData.phoneNumber &&
			!/^[+]?[1-9][\d]{0,15}$/.test(
				formData.phoneNumber.replace(/[\s\-$$$$]/g, "")
			)
		) {
			newErrors.phoneNumber = "Please enter a valid phone number";
		}

		if (formData.state && formData.state.trim().length < 2) {
			newErrors.state = "State must be at least 2 characters long";
		}

		return newErrors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const validationErrors = validateForm();
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			setIsSubmitting(false);
			return;
		}

		try {
			onSubmit({
				name: formData.name.trim(),
				street: formData.street.trim(),
				city: formData.city.trim(),
				postalCode: formData.postalCode.trim(),
				country: formData.country.trim(),
				state: formData.state.trim() || undefined,
				phoneNumber: formData.phoneNumber.trim() || undefined,
			});
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange =
		(field: keyof typeof formData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setFormData((prev) => ({ ...prev, [field]: value }));

			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: "" }));
			}
		};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>
					{isEditing ? "Edit Address" : "Add New Address"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={handleChange("name")}
								placeholder="Enter full name"
								required
								className={
									errors.name
										? "border-red-500 focus-visible:ring-red-500"
										: ""
								}
							/>
							{errors.name && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">
										{errors.name}
									</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="street">Street Address *</Label>
							<Input
								id="street"
								value={formData.street}
								onChange={handleChange("street")}
								placeholder="Enter street address"
								required
								className={
									errors.street
										? "border-red-500 focus-visible:ring-red-500"
										: ""
								}
							/>
							{errors.street && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">
										{errors.street}
									</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									value={formData.city}
									onChange={handleChange("city")}
									placeholder="Enter city"
									required
									className={
										errors.city
											? "border-red-500 focus-visible:ring-red-500"
											: ""
									}
								/>
								{errors.city && (
									<Alert
										variant="destructive"
										className="py-2">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription className="text-sm">
											{errors.city}
										</AlertDescription>
									</Alert>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="state">State/Province</Label>
								<Input
									id="state"
									value={formData.state}
									onChange={handleChange("state")}
									placeholder="Enter state"
									className={
										errors.state
											? "border-red-500 focus-visible:ring-red-500"
											: ""
									}
								/>
								{errors.state && (
									<Alert
										variant="destructive"
										className="py-2">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription className="text-sm">
											{errors.state}
										</AlertDescription>
									</Alert>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="postalCode">
									Postal Code *
								</Label>
								<Input
									id="postalCode"
									value={formData.postalCode}
									onChange={handleChange("postalCode")}
									placeholder="Enter postal code"
									required
									className={
										errors.postalCode
											? "border-red-500 focus-visible:ring-red-500"
											: ""
									}
								/>
								{errors.postalCode && (
									<Alert
										variant="destructive"
										className="py-2">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription className="text-sm">
											{errors.postalCode}
										</AlertDescription>
									</Alert>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="country">Country *</Label>
								<Input
									id="country"
									value={formData.country}
									onChange={handleChange("country")}
									placeholder="Enter country"
									required
									className={
										errors.country
											? "border-red-500 focus-visible:ring-red-500"
											: ""
									}
								/>
								{errors.country && (
									<Alert
										variant="destructive"
										className="py-2">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription className="text-sm">
											{errors.country}
										</AlertDescription>
									</Alert>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								value={formData.phoneNumber}
								onChange={handleChange("phoneNumber")}
								placeholder="Enter phone number"
								type="tel"
								className={
									errors.phoneNumber
										? "border-red-500 focus-visible:ring-red-500"
										: ""
								}
							/>
							{errors.phoneNumber && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">
										{errors.phoneNumber}
									</AlertDescription>
								</Alert>
							)}
						</div>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							type="submit"
							className="flex-1"
							disabled={isSubmitting}>
							{isSubmitting
								? "Saving..."
								: isEditing
								? "Update Address"
								: "Save Address"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
