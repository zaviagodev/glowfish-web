import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Plus, MapPin, Home, Building2, Pencil, Trash2 } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/shared/PageHeader";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  type: 'home' | 'office';
}

// Sample addresses
const sampleAddresses: Address[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    full_name: 'John Doe',
    phone: '(+66) 123-456-789',
    address1: '123 Sukhumvit Road',
    address2: 'Apartment 4B',
    city: 'Bangkok',
    state: 'Bangkok',
    postal_code: '10110',
    is_default: true,
    type: 'home'
  },
  {
    id: '38c3c53f-967c-4c0e-9c0f-7b9e0c6f8d9e',
    full_name: 'John Doe',
    phone: '(+66) 098-765-432',
    address1: '456 Silom Road',
    address2: 'Office Building, Floor 12',
    city: 'Bangkok',
    state: 'Bangkok',
    postal_code: '10500',
    is_default: false,
    type: 'office'
  },
  {
    id: 'c2d8f8d1-5c9a-4b9c-9c0f-7b9e0c6f8d9e',
    full_name: 'John Doe',
    phone: '(+66) 111-222-333',
    address1: '789 Ratchada Road',
    city: 'Bangkok',
    state: 'Bangkok',
    postal_code: '10400',
    is_default: false,
    type: 'home'
  }
];

export default function AddressSelection() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>(sampleAddresses);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    navigate('/checkout', { state: { selectedAddressId: addressId } });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const confirmDelete = (addressId: string) => {
    setAddressToDelete(addressId);
  };
  return (
    <div className="fixed inset-0 bg-background">
      {/* Header */}
      <PageHeader
        title={t("Select Delivery Address")}
        onBack={() => navigate(-1)}
      />

      <div className="mt-14 p-4">
        {/* Address List */}
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-[rgba(245,245,245,0.5)] p-3 rounded-lg border transition-all ${
                selectedAddress === address.id ? 'border-primary ring-2 ring-primary/10' : 'border-[#E5E5E5]'
              } cursor-pointer hover:border-primary/50`}
              onClick={() => handleAddressSelect(address.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex-shrink-0 flex items-center justify-center">
                  {address.type === 'home' ? (
                    <Home className="w-4 h-4 text-foreground" />
                  ) : (
                    <Building2 className="w-4 h-4 text-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{address.full_name}</span>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(address.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
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
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-w-[600px] mx-auto flex flex-col"
        >
          <SheetHeader className="px-4 py-3 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center justify-between">
            <SheetTitle className="text-title2 font-semibold tracking-tight">
              {editingAddress ? t("Edit Address") : t("Add New Address")}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-medium hover:bg-transparent"
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
            >
              {t("Cancel")}
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
            <AddressForm
              initialData={editingAddress}
              onSubmit={async (data) => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
            />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!addressToDelete} 
        onOpenChange={(open) => {
          if (!open) {
            setAddressToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="bg-background/80 backdrop-blur-xl border-0 max-w-[90%] w-[400px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Address")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to delete this address? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setAddressToDelete(null)}
              className="bg-muted text-foreground hover:bg-muted/90 w-full sm:w-auto"
            >
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              onClick={() => addressToDelete && handleDeleteAddress(addressToDelete)}
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}