"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  district: string;
  city: string;
  area: string;
  postalCode: string | null;
  instructions: string | null;
  isDefault: boolean;
};

const empty = {
  label: "Home",
  recipientName: "",
  phone: "",
  district: "",
  city: "",
  area: "",
  postalCode: "",
  instructions: "",
  isDefault: false,
};

const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/addresses");
    const payload = (await response.json()) as {
      success: boolean;
      data?: { addresses: Address[] } | Address[];
    };
    setLoading(false);
    if (payload.success) {
      const list = Array.isArray(payload.data)
        ? payload.data
        : (payload.data?.addresses ?? []);
      setAddresses(list);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/addresses")
      .then((response) => response.json())
      .then(
        (payload: {
          success: boolean;
          data?: { addresses: Address[] } | Address[];
        }) => {
          if (!active) return;
          setLoading(false);
          if (payload.success) {
            const list = Array.isArray(payload.data)
              ? payload.data
              : (payload.data?.addresses ?? []);
            setAddresses(list);
          }
        },
      )
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function startNew() {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  }

  function startEdit(address: Address) {
    setForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      district: address.district,
      city: address.city,
      area: address.area,
      postalCode: address.postalCode ?? "",
      instructions: address.instructions ?? "",
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch(
      editingId ? `/api/addresses/${editingId}` : "/api/addresses",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(payload.message ?? "Unable to save this address.");
      return;
    }
    toast.success(editingId ? "Address updated." : "Address added.");
    setOpen(false);
    setEditingId(null);
    setForm(empty);
    load();
  }

  async function setDefault(address: Address) {
    const response = await fetch(`/api/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        district: address.district,
        city: address.city,
        area: address.area,
        postalCode: address.postalCode ?? undefined,
        instructions: address.instructions ?? undefined,
        isDefault: true,
      }),
    });
    if (!response.ok) {
      toast.error("Unable to set the default address.");
      return;
    }
    toast.success("Default address updated.");
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this address?")) return;
    const response = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete this address.");
      return;
    }
    toast.success("Address deleted.");
    load();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={startNew}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="size-4" /> Add address
      </button>

      {loading ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <MapPin className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No saved addresses</p>
          <p className="text-xs text-muted-foreground">
            Add a delivery address to make checkout faster.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {address.label}
                    {address.isDefault ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm">
                    {address.recipientName} · {address.phone}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {address.area}, {address.city}, {address.district}{" "}
                    {address.postalCode}
                  </p>
                  {address.instructions ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {address.instructions}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Edit address"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(address.id)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete address"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {!address.isDefault ? (
                <button
                  type="button"
                  onClick={() => setDefault(address)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Star className="size-3.5" /> Set as default
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {open ? (
        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-bold">
            {editingId ? "Edit address" : "New address"}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Label">
              <input
                className={input}
                value={form.label}
                onChange={(event) =>
                  setForm({ ...form, label: event.target.value })
                }
              />
            </Field>
            <Field label="Recipient name">
              <input
                required
                className={input}
                value={form.recipientName}
                onChange={(event) =>
                  setForm({ ...form, recipientName: event.target.value })
                }
              />
            </Field>
            <Field label="Phone">
              <input
                required
                className={input}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </Field>
            <Field label="District">
              <input
                required
                className={input}
                value={form.district}
                onChange={(event) =>
                  setForm({ ...form, district: event.target.value })
                }
              />
            </Field>
            <Field label="City / upazila">
              <input
                required
                className={input}
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
              />
            </Field>
            <Field label="Area / street">
              <input
                required
                className={input}
                value={form.area}
                onChange={(event) =>
                  setForm({ ...form, area: event.target.value })
                }
              />
            </Field>
            <Field label="Postal code">
              <input
                className={input}
                value={form.postalCode}
                onChange={(event) =>
                  setForm({ ...form, postalCode: event.target.value })
                }
              />
            </Field>
            <Field label="Instructions">
              <input
                className={input}
                value={form.instructions}
                onChange={(event) =>
                  setForm({ ...form, instructions: event.target.value })
                }
              />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) =>
                setForm({ ...form, isDefault: event.target.checked })
              }
            />{" "}
            Make this my default address
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Save address
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}
