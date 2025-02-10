import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Plus, MapPin, Home, Building2, Pencil, Trash2 } from "lucide-react";
import { useCustomer } from "@/hooks/useCustomer";
import { supabase } from "@/lib/supabase";
import type { Address } from "@/services/customerService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddressForm } from "./address-form";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AddressSelection() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { customer, loading: customerLoading, refreshCustomer } = useCustomer();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Get addresses from customer data
  const addresses = customer?.addresses || [];

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    navigate("/checkout", { state: { selectedAddressId: addressId } });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      // Refresh customer data to get updated addresses
      await refreshCustomer();
      setAddressToDelete(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(t("Failed to delete address. Please try again."));
    }
  };

  const confirmDelete = (addressId: string) => {
    setAddressToDelete(addressId);
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header */}
      <PageHeader title={t("Select Delivery Address")} />

      <div className="mt-14 p-4">
        {/* Address List */}
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-darkgray p-3 rounded-lg transition-all ${
                selectedAddress === address.id
                  ? "border-primary ring-2 ring-primary/10"
                  : "border-[#E5E5E5]"
              } cursor-pointer hover:border-primary/50`}
              onClick={() => handleAddressSelect(address.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-icon-blue-background text-icon-blue-foreground flex-shrink-0 flex items-center justify-center">
                  {address.type === "shipping" ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">
                        {`${address.first_name} ${address.last_name}`.trim()}
                      </span>
                      {address.is_default && (
                        <span className="text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {t("Default")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(address.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button> */}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {address.phone}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {address.address1}
                    {address.address2 && `, ${address.address2}`}
                    {`, ${address.city}, ${address.state} ${address.postal_code}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Address Button */}
        <Button
          onClick={() => {
            setEditingAddress(null);
            setShowAddForm(true);
          }}
          className="w-full main-btn flex items-center gap-2 mt-3"
        >
          <Plus className="w-4 h-4" />
          {t("Add New Address")}
        </Button>
      </div>

      {/* Add/Edit Address Sheet */}
      <Sheet
        open={showAddForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingAddress(null);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-w-[600px] mx-auto flex flex-col gap-0"
        >
          <SheetHeader className="px-5 pb-3 pt-6 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-title2 font-semibold tracking-tight">
              {editingAddress ? t("Edit Address") : t("Add New Address")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <AddressForm
                initialData={editingAddress}
                onSubmit={async () => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                  // Refresh customer data to get updated addresses
                  await refreshCustomer();
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!addressToDelete}
        onOpenChange={() => setAddressToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Address")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "Are you sure you want to delete this address? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                addressToDelete && handleDeleteAddress(addressToDelete)
              }
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
