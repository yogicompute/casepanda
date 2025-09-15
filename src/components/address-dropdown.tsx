"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressForm } from "./address-form";
import { ChevronDown, MapPin, Plus, Edit, Trash } from "lucide-react";

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
  phoneNumber?: string;
}

interface AddressDropdownProps {
  userId: string;
  onAddressSelect?: (address: Address | null) => void;
}

export function AddressDropdown({ userId, onAddressSelect }: AddressDropdownProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // ⬇️ Fetch shipping addresses
  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/address?userId=${userId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(data.res || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  }, [userId]);

  const saveAddress = async (method: "POST" | "PUT", url: string, payload: unknown) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to ${method === "POST" ? "add" : "update"} address`);
      await fetchAddresses();
      setFormMode(null);
      setEditingAddress(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = (newAddress: Omit<Address, "id">) =>
    saveAddress("POST", "/api/address", { userId, shippingAddress: newAddress });

  const handleEditAddress = (updated: Omit<Address, "id">) => {
    if (!editingAddress) return;
    return saveAddress("PUT", `/api/address/${editingAddress.id}`, updated);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/address/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      await fetchAddresses();
      if (selectedAddress?.id === id) {
        setSelectedAddress(null);
        onAddressSelect?.(null);
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    onAddressSelect?.(address);
  };

  const formatAddressPreview = (address: Address) =>
    `${address.name} - ${address.street}, ${address.city}, ${address.postalCode}`;

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Show form if adding/editing
  if (formMode) {
    return (
      <AddressForm
        onSubmit={formMode === "add" ? handleAddAddress : handleEditAddress}
        onCancel={() => {
          setFormMode(null);
          setEditingAddress(null);
        }}
        initialData={formMode === "edit" ? editingAddress || undefined : undefined}
        isEditing={formMode === "edit"}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal bg-transparent"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {selectedAddress ? formatAddressPreview(selectedAddress) : "Select shipping address"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        {addresses.length > 0 ? (
          <>
            {addresses.map((address) => (
              <div key={address.id} className="relative">
                <DropdownMenuItem
                  onClick={() => handleSelectAddress(address)}
                  className="flex flex-col items-start gap-1 p-3 pr-12"
                >
                  <div className="font-medium">{address.name}</div>
                  <div className="text-sm text-muted-foreground">{address.street}</div>
                  <div className="text-sm text-muted-foreground">
                    {address.city}, {address.state && `${address.state}, `}
                    {address.postalCode}
                  </div>
                  <div className="text-sm text-muted-foreground">{address.country}</div>
                  {address.phoneNumber && (
                    <div className="text-sm text-muted-foreground">{address.phoneNumber}</div>
                  )}
                </DropdownMenuItem>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                      setFormMode("edit");
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                  >
                    <Trash className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <p className="text-center text-primary p-3">No addresses saved</p>
        )}
        <DropdownMenuItem
          onClick={() => setFormMode("add")}
          className="flex items-center gap-2 p-3 text-primary"
        >
          <Plus className="h-4 w-4" />
          Add new address
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
