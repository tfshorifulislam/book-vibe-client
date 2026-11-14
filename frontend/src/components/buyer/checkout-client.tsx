"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircle, MapPin, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/utils";

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

type CartItem = {
  itemId: string;
  quantity: number;
  subtotal: number;
  book: { title: string; author: string; price: number };
};

type Cart = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  settings: { shippingFlat: number; freeShippingThreshold: number };
};

const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

const initialAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  district: "",
  city: "",
  area: "",
  postalCode: "",
  instructions: "",
};

export function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [couponPending, setCouponPending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/cart").then((response) => response.json()),
      fetch("/api/addresses").then((response) => response.json()),
    ]).then(([cartPayload, addressPayload]) => {
      if (cartPayload.success) setCart(cartPayload.data);
      if (addressPayload.success) {
        const rawData = addressPayload.data;
        const list = (
          Array.isArray(rawData) ? rawData : (rawData?.addresses ?? [])
        ) as Address[];
        setAddresses(list);
        setAddressId(
          list.find((item) => item.isDefault)?.id ?? list[0]?.id ?? "",
        );
        setShowNew(list.length === 0);
      }
    });
  }, []);

  async function applyCoupon() {
    if (!couponCode.trim() || !cart) return;
    setCouponPending(true);
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal: cart.subtotal }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: {
        valid: boolean;
        message: string;
        discount: number;
        freeShipping: boolean;
      };
    };
    setCouponPending(false);
    if (!response.ok || !payload.success || !payload.data) {
      setCouponMessage("Unable to check this coupon.");
      return;
    }
    setCouponMessage(payload.data.message);
    if (payload.data.valid) {
      setDiscount(payload.data.discount);
      setFreeShipping(payload.data.freeShipping);
      toast.success(payload.data.message);
    } else {
      setDiscount(0);
      setFreeShipping(false);
      toast.error(payload.data.message);
    }
  }

  async function placeOrder() {
    if (!cart) return;
    if (
      !addressId &&
      (!address.recipientName ||
        !address.phone ||
        !address.city ||
        !address.district ||
        !address.area)
    ) {
      toast.error("Complete the delivery address first.");
      return;
    }
    setPlacing(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: addressId || undefined,
        address: addressId ? undefined : address,
        paymentMethod,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: {
        order: { id: string; orderNumber: string };
        paymentUrl?: string;
      };
      message?: string;
    };
    setPlacing(false);
    if (!response.ok || !payload.success || !payload.data) {
      toast.error(payload.message ?? "Unable to place your order.");
      return;
    }
    toast.success(`Order ${payload.data.order.orderNumber} placed.`);
    if (payload.data.paymentUrl) {
      window.location.href = payload.data.paymentUrl;
      return;
    }
    router.push(`/buyer/orders/${payload.data.order.id}`);
    router.refresh();
  }

  if (!cart) {
    return (
      <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
        <LoaderCircle className="mx-auto size-5 animate-spin" />
        <p className="mt-2 text-sm">Loading checkout…</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <h2 className="text-base font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a book before checking out.
        </p>
        <Link
          href="/books"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Browse books
        </Link>
      </div>
    );
  }

  const shipping = freeShipping ? 0 : cart.shipping;
  const total = Math.max(0, cart.subtotal - discount + shipping);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <MapPin className="size-4" /> Delivery address
            </h2>
            <button
              type="button"
              onClick={() => setShowNew((value) => !value)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" /> New address
            </button>
          </div>

          {addresses.length ? (
            <div className="mt-3 space-y-2">
              {addresses.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${addressId === item.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === item.id}
                    onChange={() => setAddressId(item.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">
                      {item.label} · {item.recipientName}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.phone} · {item.area}, {item.city}, {item.district}{" "}
                      {item.postalCode}
                    </span>
                  </span>
                </label>
              ))}
              {showNew ? (
                <button
                  type="button"
                  onClick={() => setAddressId("")}
                  className={`w-full rounded-lg border border-dashed p-3 text-left text-sm ${!addressId ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  Use a different address
                </button>
              ) : null}
            </div>
          ) : null}

          {showNew || !addressId ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Recipient name">
                <input
                  className={input}
                  value={address.recipientName}
                  onChange={(event) =>
                    setAddress({
                      ...address,
                      recipientName: event.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Phone">
                <input
                  className={input}
                  value={address.phone}
                  onChange={(event) =>
                    setAddress({ ...address, phone: event.target.value })
                  }
                />
              </Field>
              <Field label="District">
                <input
                  className={input}
                  value={address.district}
                  onChange={(event) =>
                    setAddress({ ...address, district: event.target.value })
                  }
                />
              </Field>
              <Field label="City / upazila">
                <input
                  className={input}
                  value={address.city}
                  onChange={(event) =>
                    setAddress({ ...address, city: event.target.value })
                  }
                />
              </Field>
              <Field label="Area / street">
                <input
                  className={input}
                  value={address.area}
                  onChange={(event) =>
                    setAddress({ ...address, area: event.target.value })
                  }
                />
              </Field>
              <Field label="Postal code">
                <input
                  className={input}
                  value={address.postalCode}
                  onChange={(event) =>
                    setAddress({ ...address, postalCode: event.target.value })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Delivery instructions (optional)">
                  <input
                    className={input}
                    value={address.instructions}
                    onChange={(event) =>
                      setAddress({
                        ...address,
                        instructions: event.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">Payment method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              [
                "COD",
                "Cash on delivery",
                "Pay the courier when your books arrive.",
              ],
              [
                "BKASH",
                "bKash",
                "Pay after placing the order using the payment instructions.",
              ],
              [
                "NAGAD",
                "Nagad",
                "Pay after placing the order using the payment instructions.",
              ],
              ["CARD", "Card", "Card payment will be confirmed by the seller."],
            ].map(([value, title, description]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-lg border p-3 text-sm ${paymentMethod === value ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />{" "}
                  {title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {description}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">Order notes</h2>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Anything the seller should know?"
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-5 xl:sticky xl:top-20">
        <h2 className="text-base font-bold">Your order</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.itemId} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="line-clamp-1">{item.book.title}</span>
                <span className="text-xs text-muted-foreground">
                  {" "}
                  × {item.quantity}
                </span>
              </span>
              <span className="shrink-0">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-border pt-4">
          <label
            htmlFor="coupon"
            className="mb-1 flex items-center gap-1 text-xs font-medium"
          >
            <Tag className="size-3.5" /> Coupon code
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              value={couponCode}
              onChange={(event) =>
                setCouponCode(event.target.value.toUpperCase())
              }
              className={input}
              placeholder="WELCOME10"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponPending}
              className="inline-flex h-10 shrink-0 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              {couponPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {couponMessage ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {couponMessage}
            </p>
          ) : null}
        </div>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(cart.subtotal)}</dd>
          </div>
          {discount ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="text-success">−{formatPrice(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{shipping ? formatPrice(shipping) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={placeOrder}
          disabled={placing}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {placing ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Place order · {formatPrice(total)}
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By placing this order you agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/return-policy" className="text-primary hover:underline">
            return policy
          </Link>
          .
        </p>
      </aside>
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
