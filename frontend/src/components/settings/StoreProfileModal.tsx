import React, { useState } from 'react';
import { Modal, Button, Input } from '../ui';
import { Store, Upload, Image, Phone, MapPin, Building, FileText, CheckCircle2 } from 'lucide-react';
import { settingsApi } from '../../api/settingsApi';

export interface StoreProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: any;
  onProfileUpdated: (updated: any) => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  onProfileUpdated,
}) => {
  const [businessName, setBusinessName] = useState(storeProfile?.businessName || '');
  const [ownerName, setOwnerName] = useState(storeProfile?.ownerName || '');
  const [phone, setPhone] = useState(storeProfile?.phone || '');
  const [email, setEmail] = useState(storeProfile?.email || '');
  const [city, setCity] = useState(storeProfile?.city || 'Mumbai');
  const [state, setState] = useState(storeProfile?.state || 'Maharashtra');
  const [address, setAddress] = useState(storeProfile?.address || '');
  const [gstin, setGstin] = useState(storeProfile?.gstin || '');
  const [receiptFooter, setReceiptFooter] = useState(
    storeProfile?.receiptFooter || 'Thank you for visiting! Please visit again.'
  );
  const [logoUrl, setLogoUrl] = useState(storeProfile?.logoUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const res = await settingsApi.updateProfile({
        businessName,
        ownerName,
        phone,
        email,
        city,
        state,
        address,
        gstin,
        receiptFooter,
        logoUrl,
      });

      if (res?.store) {
        onProfileUpdated(res.store);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update store profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Profile & Cafe Branding"
      description="Update your restaurant name, contact information, and brand logo."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Store profile updated successfully!
          </div>
        )}

        {/* Cafe Logo Upload Section */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-amber-400/60 dark:border-amber-700/60 flex items-center justify-center overflow-hidden bg-white dark:bg-stone-900 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Cafe Logo" className="w-full h-full object-cover" />
            ) : (
              <Image className="w-6 h-6 text-amber-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Cafe Logo / Icon</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Displays on billing receipts, POS terminal headers, and staff login.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all active:scale-95 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Business / Cafe Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            leftIcon={<Store className="w-4 h-4" />}
            required
          />
          <Input
            label="Owner / Manager Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Shop / Building, Street, Area"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="GSTIN / Tax Number (Optional)"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            leftIcon={<Building className="w-4 h-4" />}
          />
          <Input
            label="Receipt Footer Note"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
