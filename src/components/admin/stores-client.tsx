"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Pencil,
  Phone,
  Store,
  Clock,
  X,
  Loader2,
  Power,
} from "lucide-react";
import { toast } from "sonner";

import {
  createStore,
  updateStore,
  toggleStoreStatus,
} from "@/actions/admin/stores";

type StoreRecord = {
  id: string;
  name: string;
  code: string;
  ownerName: string;
  contactNumber: string;
  alternateContact: string | null;
  email: string | null;
  addressLine: string;
  landmark: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  name: "",
  code: "",
  ownerName: "",
  contactNumber: "",
  alternateContact: "",
  email: "",
  addressLine: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  pinCode: "",
  country: "India",
  latitude: "",
  longitude: "",
  openingHours: "",
  instructions: "",
};

type FormState = typeof emptyForm;

export default function StoresClient({
  initialStores,
}: {
  initialStores: StoreRecord[];
}) {
  const router = useRouter();
  const [stores, setStores] = useState(initialStores);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeCount = stores.filter((store) => store.isActive).length;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(store: StoreRecord) {
    setEditingId(store.id);

    setForm({
      name: store.name,
      code: store.code,
      ownerName: store.ownerName,
      contactNumber: store.contactNumber,
      alternateContact: store.alternateContact ?? "",
      email: store.email ?? "",
      addressLine: store.addressLine,
      landmark: store.landmark ?? "",
      city: store.city,
      district: store.district,
      state: store.state,
      pinCode: store.pinCode,
      country: store.country,
      latitude: store.latitude?.toString() ?? "",
      longitude: store.longitude?.toString() ?? "",
      openingHours: store.openingHours ?? "",
      instructions: store.instructions ?? "",
    });

    setModalOpen(true);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      ...form,
      ...(editingId ? { id: editingId } : {}),
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateStore(payload)
        : await createStore(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setModalOpen(false);
      router.refresh();
    });
  }

  function handleToggle(store: StoreRecord) {
    startTransition(async () => {
      const result = await toggleStoreStatus({
        id: store.id,
        isActive: !store.isActive,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setStores((current) =>
        current.map((item) =>
          item.id === store.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );
      router.refresh();
    });
  }

  const inputClass =
    "w-full rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10";

  const labelClass = "mb-1.5 block text-xs font-semibold text-[#465748]";

  function field(
    label: string,
    key: keyof FormState,
    placeholder: string,
    required = false,
    type = "text",
  ) {
    return (
      <label className="block">
        <span className={labelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        <input
          type={type}
          required={required}
          value={form[key]}
          onChange={(event) => updateField(key, event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55784c]">
              Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1c3324] sm:text-3xl">
              Amaze Stores
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage pickup locations and store contact details.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2b4934]"
          >
            <Plus size={17} />
            Add New Store
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e5e9e1] bg-white p-5">
            <p className="text-sm text-gray-500">Total stores</p>
            <p className="mt-2 text-3xl font-bold text-[#1c3324]">
              {stores.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e5e9e1] bg-white p-5">
            <p className="text-sm text-gray-500">Active pickup locations</p>
            <p className="mt-2 text-3xl font-bold text-[#55784c]">
              {activeCount}
            </p>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5c5] bg-white p-12 text-center">
            <Store className="mx-auto text-[#55784c]" size={34} />
            <h2 className="mt-4 font-semibold text-[#1c3324]">
              No stores added yet
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add your first Amaze pickup location.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {stores.map((store) => (
              <article
                key={store.id}
                className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#55784c]">
                      <Store size={21} />
                    </div>
                    <div>
                      <h2 className="font-bold text-[#1c3324]">{store.name}</h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Store code: {store.code}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      store.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <p className="flex gap-2">
                    <MapPin size={17} className="shrink-0 text-[#55784c]" />
                    <span>
                      {store.addressLine}
                      {store.landmark ? `, ${store.landmark}` : ""}
                      <br />
                      {store.city}, {store.district}, {store.state} -{" "}
                      {store.pinCode}, {store.country}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-[#55784c]" />
                    {store.ownerName} · {store.contactNumber}
                  </p>

                  {store.openingHours && (
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="text-[#55784c]" />
                      {store.openingHours}
                    </p>
                  )}

                  {store.email && (
                    <p className="break-all text-xs text-gray-500">
                      {store.email}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(store)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#334536] hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggle(store)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Power size={14} />
                    {store.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:p-6">
          <div className="my-auto w-full max-w-3xl rounded-2xl bg-[#fdfdf9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-[#1c3324]">
                  {editingId ? "Edit Store" : "Add New Store"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the official pickup location details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <section>
                <h3 className="mb-3 text-sm font-bold text-[#55784c]">
                  Store information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {field(
                    "Store name",
                    "name",
                    "Amaze Ayurveda Muzaffarpur",
                    true,
                  )}
                  {field("Store code", "code", "MZP-001", true)}
                  {field(
                    "Owner / Manager name",
                    "ownerName",
                    "Full name",
                    true,
                  )}
                  {field(
                    "Contact number",
                    "contactNumber",
                    "10-digit mobile",
                    true,
                    "tel",
                  )}
                  {field(
                    "Alternate contact",
                    "alternateContact",
                    "Optional mobile",
                    false,
                    "tel",
                  )}
                  {field("Email", "email", "store@example.com", false, "email")}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold text-[#55784c]">
                  Store address
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    {field(
                      "Address line",
                      "addressLine",
                      "Building, road, locality",
                      true,
                    )}
                  </div>
                  {field("Landmark", "landmark", "Near landmark")}
                  {field("City / Town", "city", "City", true)}
                  {field("District", "district", "District", true)}
                  {field("State", "state", "State", true)}
                  {field("PIN code", "pinCode", "6-digit PIN", true)}
                  {field("Country", "country", "India", true)}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold text-[#55784c]">
                  Additional information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {field(
                    "Latitude",
                    "latitude",
                    "Optional map latitude",
                    false,
                    "number",
                  )}
                  {field(
                    "Longitude",
                    "longitude",
                    "Optional map longitude",
                    false,
                    "number",
                  )}
                  <div className="sm:col-span-2">
                    {field(
                      "Opening hours",
                      "openingHours",
                      "e.g. Mon-Sat, 10 AM - 6 PM",
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Pickup instructions</label>
                    <textarea
                      value={form.instructions}
                      onChange={(event) =>
                        updateField("instructions", event.target.value)
                      }
                      rows={3}
                      placeholder="Any instructions for customers collecting orders..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Create Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
