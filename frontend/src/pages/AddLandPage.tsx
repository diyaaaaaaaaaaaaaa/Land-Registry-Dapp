// src/pages/AddLandPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useParcel } from "@/contexts/ParcelContext";
import { useContract } from "@/hooks/useContract";

const AddLandPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { districts, addParcel } = useParcel();
  const { submit: submitOnChain } = useContract();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    tehsil: "",
    village: "",
    khasraNumber: "",
    area: "",
    notes: "",
    documentCID: "",
  });

  const handleNext = () => {
    setStep((s) => Math.min(5, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

const handleSubmit = async () => {
  if (!formData.fullName || !formData.khasraNumber || !formData.district) {
    toast({ title: "Missing fields", description: "Please fill required fields." });
    return;
  }

  // --- WALLET CHECK ---
  const wallet =
    (window as any).aptos ||
    (window as any).petra ||
    (window as any).martian ||
    null;

  if (!wallet) {
    toast({
      title: "Wallet not found",
      description: "Install Petra or Martian wallet to submit on-chain.",
      variant: "destructive",
    });
    return;
  }

  try {
    await wallet.connect();
  } catch {
    toast({
      title: "Wallet connection failed",
      description: "Please unlock your wallet or approve the request.",
      variant: "destructive",
    });
    return;
  }

  // --- ON-CHAIN SUBMIT ---
  try {
    toast({ title: "Submitting", description: "Sending transaction to blockchain..." });

    await submitOnChain({
  khasra_number: formData.khasraNumber || "",
  document_cid: formData.documentCID || "",
  area_sqm: Number(formData.area) || 0,
  notes: formData.notes || "",
  village: formData.village || "",
  tehsil: formData.tehsil || "",
  district: formData.district || "",
});


    toast({
      title: "Submitted on-chain",
      description: "Transaction sent successfully.",
    });
  } catch (err) {
    toast({
      title: "Blockchain error",
      description: (err as Error).message,
      variant: "destructive",
    });
  }

  // always add locally
  const newParcelId = addParcel({
    khasraNumber: formData.khasraNumber,
    ownerName: formData.fullName,
    ownerWallet: wallet.address || "0x",
    district: formData.district,
    tehsil: formData.tehsil,
    village: formData.village,
    area: Number(formData.area) || 0,
    status: "pending",
    documentCID: formData.documentCID || undefined,
    notes: formData.notes || undefined,
  });

  toast({
    title: "Success",
    description: `Parcel submitted! ID: ${newParcelId}`,
  });

  navigate("/my-lands");
};


  return (
    <div className="min-h-screen tribal-pattern">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto vintage-border">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">➕ Add Your Land</CardTitle>
            <CardDescription>Step {step} of 5</CardDescription>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                <div>
                  <Label htmlFor="fullName">Your Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Your Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <Button onClick={handleNext} className="w-full">
                  NEXT →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Land Location</h3>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tehsil">Tehsil *</Label>
                  <Input
                    id="tehsil"
                    value={formData.tehsil}
                    onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                    placeholder="Enter tehsil name"
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Enter village name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    ← BACK
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    NEXT →
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Land Details</h3>
                <div>
                  <Label htmlFor="khasraNumber">Khasra Number *</Label>
                  <Input
                    id="khasraNumber"
                    value={formData.khasraNumber}
                    onChange={(e) => setFormData({ ...formData, khasraNumber: e.target.value })}
                    placeholder="e.g., 315/2A"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area (sqm) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes/Description</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., Agricultural land with well"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    ← BACK
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    NEXT →
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Document Upload</h3>
                <div>
                  <Label htmlFor="documentUpload">Upload Document *</Label>
                  <Input id="documentUpload" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  <p className="text-sm text-muted-foreground mt-1">PDF or Image files only</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">OR</p>
                </div>
                <div>
                  <Label htmlFor="documentCID">IPFS CID (if already uploaded)</Label>
                  <Input
                    id="documentCID"
                    value={formData.documentCID}
                    onChange={(e) => setFormData({ ...formData, documentCID: e.target.value })}
                    placeholder="QmXxxx..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    ← BACK
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    NEXT →
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Review & Submit</h3>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6 space-y-2">
                    <p><strong>Name:</strong> {formData.fullName}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                    <p><strong>Location:</strong> {formData.village}, {formData.tehsil}, {formData.district}</p>
                    <p><strong>Khasra:</strong> {formData.khasraNumber}</p>
                    <p><strong>Area:</strong> {formData.area} sqm</p>
                    {formData.notes && <p><strong>Notes:</strong> {formData.notes}</p>}
                    {formData.documentCID && <p><strong>Document CID:</strong> {formData.documentCID}</p>}
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    ✏️ EDIT
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    📤 SUBMIT FOR APPROVAL
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddLandPage;
