import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
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
import { VatForm } from "./vat-form";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface VatProfile {
  id: string;
  enabled: boolean;
  companyName: string;
  taxId: string;
  branch?: string;
  address: string;
  is_default: boolean;
}

// Sample VAT profiles
const sampleVatProfiles: VatProfile[] = [
  {
    id: "1",
    enabled: true,
    companyName: "Example Company Co., Ltd.",
    taxId: "0123456789012",
    branch: "00000",
    address: "123 Business Road, Bangkok 10110",
    is_default: true,
  },
  {
    id: "2",
    enabled: true,
    companyName: "Another Business Corp.",
    taxId: "9876543210987",
    branch: "00001",
    address: "456 Corporate Street, Bangkok 10120",
    is_default: false,
  },
];

export default function VatInvoicePage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<VatProfile[]>(sampleVatProfiles);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VatProfile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    navigate("/checkout", { state: { selectedVatProfileId: profileId } });
  };

  const handleEditProfile = (profile: VatProfile) => {
    setEditingProfile(profile);
    setShowAddForm(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("vat_profiles")
        .delete()
        .eq("id", profileId);

      if (error) throw error;
      setProfiles(profiles.filter((profile) => profile.id !== profileId));
      setProfileToDelete(null);
    } catch (error) {
      console.error("Error deleting VAT profile:", error);
    }
  };

  const confirmDelete = (profileId: string) => {
    setProfileToDelete(profileId);
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header */}
      <PageHeader title={t("VAT Invoice Details")} />

      <div className="mt-14 mb-20 p-4">
        {/* VAT Enable/Disable Switch */}
        <div className="bg-darkgray p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                {t("Request VAT Invoice")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("Enable to add company information for VAT invoice")}
              </p>
            </div>
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} />
          </div>
        </div>

        {vatEnabled && (
          <>
            {/* Add New Profile Button */}
            <Button
              onClick={() => {
                setEditingProfile(null);
                setShowAddForm(true);
              }}
              className="w-full mb-4 bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("Add New Company")}
            </Button>

            {/* Profile List */}
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`bg-tertiary p-3 rounded-lg border transition-all ${
                    selectedProfile === profile.id
                      ? "border-primary ring-2 ring-primary/10"
                      : "border-[#E5E5E5]"
                  } cursor-pointer hover:border-primary/50`}
                  onClick={() => handleProfileSelect(profile.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex-shrink-0 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">
                            {profile.companyName}
                          </span>
                          {profile.is_default && (
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
                              handleEditProfile(profile);
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
                              confirmDelete(profile.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("Tax ID")}: {profile.taxId}
                        {profile.branch &&
                          ` • ${t("Branch")}: ${profile.branch}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {profile.address}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Profile Sheet */}
      <Sheet
        open={showAddForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingProfile(null);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-w-[600px] mx-auto flex flex-col"
        >
          <SheetHeader className="px-4 py-3 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center justify-between">
            <SheetTitle className="text-title2 font-semibold tracking-tight">
              {editingProfile ? t("Edit Company") : t("Add New Company")}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-medium hover:bg-transparent"
              onClick={() => {
                setShowAddForm(false);
                setEditingProfile(null);
              }}
            >
              {t("Cancel")}
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <VatForm
                initialData={editingProfile}
                onSubmit={async (data) => {
                  setShowAddForm(false);
                  setEditingProfile(null);
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!profileToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProfileToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="bg-background/80 backdrop-blur-xl border-0 max-w-[90%] w-[400px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Company")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "Are you sure you want to delete this company? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setProfileToDelete(null)}
              className="bg-muted text-foreground hover:bg-muted/90 w-full sm:w-auto"
            >
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              onClick={() =>
                profileToDelete && handleDeleteProfile(profileToDelete)
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
