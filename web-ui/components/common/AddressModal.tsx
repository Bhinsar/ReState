"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Building2,
  Navigation,
  Hash,
  Layers,
  Landmark,
  Globe,
  MailOpen,
  Map,
} from "lucide-react";
import {
  addressResponse,
  addressCreateRequest,
} from "@/services/addresses/address.interface";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/fromInput";
import MapView from "@/components/common/map";
import { useGeolocation } from "@/hooks/useGeolocation";

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const addressSchema = z.object({
  address: z.string().min(3, "Street address is required"),
  plotNumber: z.string().optional(),
  floor: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pinCode: z.string().min(4, "Pin code is required"),
  latitude: z.coerce.number().min(-90).max(90, "Enter a valid latitude"),
  longitude: z.coerce.number().min(-180).max(180, "Enter a valid longitude"),
});

type AddressFormData = z.infer<typeof addressSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────
export type AddressModalMode = "create" | "edit" | "view";

interface AddressModalProps {
  isOpen: boolean;
  mode: AddressModalMode;
  existingAddress?: addressResponse | null;
  onClose: () => void;
  onSuccess?: (address: addressResponse) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  mode,
  existingAddress,
  onClose,
  onSuccess,
}) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const { longitude: lng, latitude: lat } = useGeolocation();

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<AddressFormData, unknown, AddressFormData>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      address: "",
      plotNumber: "",
      floor: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pinCode: "",
      latitude: lat,
      longitude: lng,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const latVal = Number(latitude) || 0;
  const lngVal = Number(longitude) || 0;

  // Pre-fill form when editing
  useEffect(() => {
    if (existingAddress && (isEdit || isView)) {
      reset({
        address: existingAddress.address,
        plotNumber: existingAddress.plotNumber ?? "",
        floor: existingAddress.floor ?? "",
        landmark: existingAddress.landmark ?? "",
        city: existingAddress.city,
        state: existingAddress.state,
        country: existingAddress.country,
        pinCode: existingAddress.pinCode,
        latitude: existingAddress.latitude,
        longitude: existingAddress.longitude,
      });
    } else if (mode === "create") {
      reset({
        address: "",
        plotNumber: "",
        floor: "",
        landmark: "",
        city: "",
        state: "",
        country: "India",
        pinCode: "",
        latitude: 0,
        longitude: 0,
      });
    }
  }, [existingAddress, mode, reset, isEdit, isView]);

  const onSubmit = async (data: AddressFormData) => {
    const payload: addressCreateRequest = {
      address: data.address,
      plotNumber: data.plotNumber || undefined,
      floor: data.floor || undefined,
      landmark: data.landmark || undefined,
      city: data.city,
      state: data.state,
      country: data.country,
      pinCode: data.pinCode,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    if (isEdit && existingAddress?.addressId) {
      updateAddress.mutate(
        { id: existingAddress.addressId, data: payload },
        {
          onSuccess: (result) => {
            onSuccess?.(result);
            onClose();
          },
        },
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: (result) => {
          onSuccess?.(result);
          onClose();
        },
      });
    }
  };

  const isPending =
    createAddress.isPending || updateAddress.isPending || isSubmitting;
  const title =
    mode === "create" ? "Add New Address"
    : mode === "edit" ? "Edit Address"
    : "Address Details";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[96vw] max-w-2xl sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <DialogHeader className="flex-row items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base font-bold text-slate-800">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              {mode === "view" ?
                "Saved address details"
              : "Fill in the address information below"}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>✕
          </Button>
        </DialogHeader>

        {/* ── Scrollable Body ───────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form
            id="address-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Street Address */}
            <FormInput
              name="address"
              control={control}
              label="Street Address"
              placeholder="e.g. 42, MG Road"
              startIcon={<MapPin />}
              required
              isDisabled={isView}
            />

            {/* Plot / Floor */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="plotNumber"
                control={control}
                label="Plot / House No."
                placeholder="e.g. Plot 7B"
                startIcon={<Hash />}
                isDisabled={isView}
              />
              <FormInput
                name="floor"
                control={control}
                label="Floor"
                placeholder="e.g. 3rd Floor"
                startIcon={<Layers />}
                isDisabled={isView}
              />
            </div>

            {/* Landmark */}
            <FormInput
              name="landmark"
              control={control}
              label="Landmark"
              placeholder="e.g. Near Central Park"
              startIcon={<Landmark />}
              isDisabled={isView}
            />

            {/* City / State */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="city"
                control={control}
                label="City"
                placeholder="e.g. Bangalore"
                startIcon={<Building2 />}
                required
                isDisabled={isView}
                isReadOnly={true}
              />
              <FormInput
                name="state"
                control={control}
                label="State"
                placeholder="e.g. Karnataka"
                startIcon={<Building2 />}
                required
                isDisabled={isView}
                isReadOnly={true}
              />
            </div>

            {/* Country / Pin Code */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="country"
                control={control}
                label="Country"
                placeholder="India"
                startIcon={<Globe />}
                required
                isDisabled={isView}
                isReadOnly={true}
              />
              <FormInput
                name="pinCode"
                control={control}
                label="Pin Code"
                placeholder="e.g. 560001"
                startIcon={<MailOpen />}
                required
                isDisabled={isView}
              />
            </div>

            {/* Coordinates
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="latitude"
                control={control}
                label="Latitude"
                type="number"
                placeholder="e.g. 12.9716"
                startIcon={<Navigation />}
                required
                isDisabled={isView}
              />
              <FormInput
                name="longitude"
                control={control}
                label="Longitude"
                type="number"
                placeholder="e.g. 77.5946"
                startIcon={<Navigation className="rotate-90" />}
                required
                isDisabled={isView}
              />
            </div> */}

            {/* ── Map Placeholder ─────────────────────────────────── */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Map className="w-3.5 h-3.5" />
                  Location Preview
                </label>
                {!isView && (
                  <button
                    type="button"
                    // onClick={handleDetectLocation}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Detect Current Location
                  </button>
                )}
              </div>
              <div className="w-full h-64 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden">
                <MapView
                  lat={latVal}
                  lng={lngVal}
                  readOnly={isView}
                  //   onLocationChange={handleLocationChange}
                />
              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        {!isView ?
          <DialogFooter className="my-1 ">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="address-form"
              disabled={isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ?
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              : isEdit ?
                "Update Address"
              : "Save Address"}
            </Button>
          </DialogFooter>
        : <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        }
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
