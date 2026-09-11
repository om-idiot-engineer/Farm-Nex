"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, Save, User, MapPin, Building2, Sprout, Phone, Mail, Scale, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DemoProfile } from "@/lib/data/demo";
import { saveProfile } from "@/lib/services/domain";
import { useUser } from "@/lib/auth/UserContext";

const POPULAR_CROPS = [
  "Soybean",
  "Wheat",
  "Cotton",
  "Gram (Chana)",
  "Maize",
  "Mustard",
  "Garlic",
  "Onion",
  "Paddy (Basmati)",
  "Moong",
  "Tur (Arhar)",
  "Chilli",
];

const MANDI_LOCATIONS = [
  "Indore, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Khandwa, Madhya Pradesh",
  "Dewas, Madhya Pradesh",
  "Ujjain, Madhya Pradesh",
  "Sehore, Madhya Pradesh",
  "Khargone, Madhya Pradesh",
  "Harda, Madhya Pradesh",
  "Mandsaur, Madhya Pradesh",
  "Neemuch, Madhya Pradesh",
  "Kota, Rajasthan",
  "Pune, Maharashtra",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DemoProfile;
  onProfileUpdated?: (updated: DemoProfile) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { setUser, user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [about, setAbout] = useState(profile.about || "");
  const [location, setLocation] = useState(profile.location || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [email, setEmail] = useState(profile.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl || "");

  // Farmer specific
  const [farmSizeAcres, setFarmSizeAcres] = useState<string>(
    profile.farmSizeAcres ? String(profile.farmSizeAcres) : ""
  );
  const [soilType, setSoilType] = useState(profile.soilType || "Black Soil (Regur)");
  const [fpo, setFpo] = useState(profile.fpo || "");

  // Buyer specific
  const [business, setBusiness] = useState(profile.business || "");
  const [procurementCapacity, setProcurementCapacity] = useState(
    profile.procurementCapacity || ""
  );
  const [gstNumber, setGstNumber] = useState(profile.gstNumber || "");

  // Commodities
  const [selectedCrops, setSelectedCrops] = useState<string[]>(profile.crops || []);
  const [customCropInput, setCustomCropInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(profile.name || "");
    setHeadline(profile.headline || "");
    setAbout(profile.about || "");
    setLocation(profile.location || "");
    setPhone(profile.phone || "");
    setEmail(profile.email || "");
    setAvatarUrl(profile.avatarUrl || "");
    setFarmSizeAcres(profile.farmSizeAcres ? String(profile.farmSizeAcres) : "");
    setSoilType(profile.soilType || "Black Soil (Regur)");
    setFpo(profile.fpo || "");
    setBusiness(profile.business || "");
    setProcurementCapacity(profile.procurementCapacity || "");
    setGstNumber(profile.gstNumber || "");
    setSelectedCrops(profile.crops || []);
    setSuccess(false);
  }, [profile, isOpen]);

  // Restrict editing if the modal is somehow opened for another user's profile
  if (!isOpen) return null;

  const isFarmer = profile.role === "farmer" || profile.role === "fpo";
  const isBuyer = profile.role === "buyer";

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const addCustomCrop = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = customCropInput.trim();
    if (clean && !selectedCrops.includes(clean)) {
      setSelectedCrops([...selectedCrops, clean]);
      setCustomCropInput("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updated: DemoProfile = {
      ...profile,
      name: name.trim() || profile.name,
      headline: headline.trim() || profile.headline,
      about: about.trim() || profile.about,
      location: location.trim() || profile.location,
      phone: phone.trim() || profile.phone,
      email: email.trim() || profile.email,
      avatarUrl: avatarUrl || undefined,
      crops: selectedCrops.length > 0 ? selectedCrops : profile.crops,
      ...(isFarmer
        ? {
            farmSizeAcres: farmSizeAcres ? parseFloat(farmSizeAcres) : undefined,
            soilType: soilType.trim() || undefined,
            fpo: fpo.trim() || undefined,
          }
        : {}),
      ...(isBuyer
        ? {
            business: business.trim() || undefined,
            procurementCapacity: procurementCapacity.trim() || undefined,
            gstNumber: gstNumber.trim() || undefined,
          }
        : {}),
    };

    saveProfile(updated);

    if (user && user.id === profile.id) {
      setUser({
        ...user,
        name: updated.name,
        headline: updated.headline,
        about: updated.about,
        phone: updated.phone,
        email: updated.email,
        avatar: updated.avatarUrl || user.avatar,
        ...(isFarmer
          ? {
              farmer_profile: {
                location: updated.location,
                lat: user.farmer_profile?.lat || 22.7196,
                lng: user.farmer_profile?.lng || 75.8577,
                fpo_name: updated.fpo,
                crops: updated.crops,
                farm_size_acres: updated.farmSizeAcres,
                soil_type: updated.soilType,
                headline: updated.headline,
                about: updated.about,
              },
            }
          : {}),
        ...(isBuyer
          ? {
              buyer_profile: {
                business_name: updated.business || user.buyer_profile?.business_name || updated.name,
                gst_verified: true,
                location: updated.location,
                lat: user.buyer_profile?.lat || 22.9676,
                lng: user.buyer_profile?.lng || 76.0534,
                procurement_capacity: updated.procurementCapacity,
                gst_number: updated.gstNumber,
                commodities: updated.crops,
                headline: updated.headline,
                about: updated.about,
              },
            }
          : {}),
      });
    }

    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0 border border-zinc-200">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>{name ? name.slice(0, 2).toUpperCase() : "PR"}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                Edit Personal Profile
              </h2>
              <p className="text-xs text-zinc-500">
                Update your picture, mandi location (Indore, Bhopal, Khandwa), and agricultural details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" /> Profile Picture
              </h3>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Reset to Initials
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white ring-2 ring-emerald-500/20">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{name ? name.slice(0, 2).toUpperCase() : "ME"}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-zinc-300"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo from Device
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Upload JPG, PNG or WebP under 2MB. Appears across your network posts, messages, and profile.
                </p>

                {/* Preset Options */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">Sample Avatars:</span>
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`h-7 w-7 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === url ? "border-emerald-600 ring-2 ring-emerald-400" : "border-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Full Name / Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Balram Patidar"
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Location (Mandi / Tehsil / District) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Indore, Madhya Pradesh"
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
                {/* Mandi quick picks */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {["Indore, MP", "Bhopal, MP", "Khandwa, MP", "Dewas, MP", "Ujjain, MP"].map((mandi) => (
                    <button
                      key={mandi}
                      type="button"
                      onClick={() => setLocation(`${mandi.replace(", MP", "")}, Madhya Pradesh`)}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition"
                    >
                      {mandi}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Headline / Designation
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Progressive Soybean & Wheat Cultivator | Sanwer Mandi"
                className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                About &amp; Agricultural Background
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your farming methods, procurement focus, storage capacities, or quality commitments..."
                className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Contact Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@farmnex.in"
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Fields: Farmer */}
          {isFarmer && (
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Farm &amp; Agronomic Specs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Farm Land (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Soil Type
                  </label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    placeholder="e.g. Medium Deep Black"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    FPO / Cooperative
                  </label>
                  <input
                    type="text"
                    value={fpo}
                    onChange={(e) => setFpo(e.target.value)}
                    placeholder="e.g. Malwa Kisan Samriddhi"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Fields: Buyer */}
          {isBuyer && (
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Commercial &amp; Processing Specs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Enterprise / Mill Name
                  </label>
                  <input
                    type="text"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder="e.g. Malwa Agro Processing"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Monthly Procurement
                  </label>
                  <input
                    type="text"
                    value={procurementCapacity}
                    onChange={(e) => setProcurementCapacity(e.target.value)}
                    placeholder="e.g. 5,000 Qtl/month"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    GSTIN / Reg Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 23AABCU9603R1ZM"
                    className="w-full px-3.5 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Crops / Commodities Chips */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              {isFarmer ? "Cultivated Produce & Commodities" : "Procurement Commodities"}
            </h3>

            {/* Quick selectors */}
            <div className="flex flex-wrap gap-2">
              {POPULAR_CROPS.map((crop) => {
                const active = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      active
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    {crop}
                  </button>
                );
              })}
            </div>

            {/* Custom Crop Add */}
            <div className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={customCropInput}
                onChange={(e) => setCustomCropInput(e.target.value)}
                onKeyDown={addCustomCrop}
                placeholder="Add another commodity..."
                className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomCrop}
                className="text-xs font-bold h-8"
              >
                Add
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold text-xs h-10 px-5"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || success}
            className={`rounded-xl font-bold text-xs h-10 px-6 transition-all ${
              success
                ? "bg-emerald-600 text-white"
                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
            }`}
          >
            {success ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Saved!
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
