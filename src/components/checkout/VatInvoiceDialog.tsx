import { useTranslate } from "@refinedev/core";
import { Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Building } from "lucide-react";

interface VatInvoiceData {
  enabled: boolean;
  companyName: string;
  taxId: string;
  branch?: string;
  address: string;
}

interface VatInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: VatInvoiceData;
  onSave: (data: VatInvoiceData) => void;
}

// Sample saved VAT profiles - replace with actual data from your backend
const savedVatProfiles = [
  {
    id: '1',
    companyName: 'Example Company Co., Ltd.',
    taxId: '0123456789012',
    branch: '00000',
    address: '123 Business Road, Bangkok 10110'
  },
  {
    id: '2',
    companyName: 'Another Business Corp.',
    taxId: '9876543210987',
    branch: '00001',
    address: '456 Corporate Street, Bangkok 10120'
  }
];

export function VatInvoiceDialog({
  open,
  onOpenChange,
  initialData = {
    enabled: false,
    companyName: "",
    taxId: "",
    branch: "",
    address: ""
  },
  onSave
}: VatInvoiceDialogProps) {
  const t = useTranslate();
  const [data, setData] = useState<VatInvoiceData>(initialData);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const handleProfileSelect = (profileId: string) => {
    const profile = savedVatProfiles.find(p => p.id === profileId);
    if (profile) {
      setData({
        enabled: true,
        ...profile
      });
      setSelectedProfile(profileId);
      setShowNewForm(false);
    }
  };

  const handleSave = () => {
    if (!data.enabled) {
      onSave({
        enabled: false,
        companyName: "",
        taxId: "",
        branch: "",
        address: ""
      });
    } else {
      onSave(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-[90%] w-[400px] rounded-lg p-0 border-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-semibold">
              {t("Request VAT Invoice")}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="vat-invoice" className="text-base font-medium">
              {t("Request VAT Invoice")}
            </Label>
            <Switch
              id="vat-invoice"
              checked={data.enabled}
              onCheckedChange={(checked) => setData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {data.enabled && (
            <>
              <RadioGroup
                value={selectedProfile || ''}
                onValueChange={(value) => {
                  if (value === 'new') {
                    setShowNewForm(true);
                    setSelectedProfile(null);
                  } else {
                    handleProfileSelect(value);
                  }
                }}
                className="gap-3"
              >
                {savedVatProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-start p-3 rounded-lg border ${
                      selectedProfile === profile.id
                        ? 'border-primary bg-primary/5'
                        : 'border-[#E5E5E5] bg-[#F8F8F8]'
                    }`}
                  >
                    <RadioGroupItem
                      value={profile.id}
                      id={profile.id}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <Label
                        htmlFor={profile.id}
                        className="text-base font-medium"
                      >
                        {profile.companyName}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("Tax ID")}: {profile.taxId}
                        {profile.branch && ` • ${t("Branch")}: ${profile.branch}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {profile.address}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add New Profile Option */}
                <div
                  className={`flex items-start p-3 rounded-lg border ${
                    showNewForm
                      ? 'border-primary bg-primary/5'
                      : 'border-[#E5E5E5] bg-[#F8F8F8]'
                  }`}
                >
                  <RadioGroupItem value="new" id="new" className="mt-1" />
                  <div className="ml-3">
                    <Label
                      htmlFor="new"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t("Add New Company")}
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {showNewForm && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">{t("Company Name")}</Label>
                    <Input
                      id="company-name"
                      value={data.companyName}
                      onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder={t("Enter company name")}
                      className="h-12 bg-[#F8F8F8] border-[#E5E5E5] focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-id">{t("Tax ID")}</Label>
                    <Input
                      id="tax-id"
                      value={data.taxId}
                      onChange={(e) => setData(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder={t("Enter tax ID")}
                      className="h-12 bg-[#F8F8F8] border-[#E5E5E5] focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">{t("Branch No.")} ({t("Optional")})</Label>
                    <Input
                      id="branch"
                      value={data.branch}
                      onChange={(e) => setData(prev => ({ ...prev, branch: e.target.value }))}
                      placeholder={t("Enter branch number")}
                      className="h-12 bg-[#F8F8F8] border-[#E5E5E5] focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t("Company Address")}</Label>
                    <Input
                      id="address"
                      value={data.address}
                      onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t("Enter company address")}
                      className="h-12 bg-[#F8F8F8] border-[#E5E5E5] focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 border-[#E5E5E5] hover:bg-[#F8F8F8]"
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
            >
              {t("Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}