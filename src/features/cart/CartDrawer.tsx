"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";
import { buildOrderMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";
import { CartLineItem } from "./CartLineItem";

const paymentMethods = ["Efectivo contra entrega", "Transferencia (Nequi/Daviplata/Bancolombia)", "Tarjeta"];

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const activeFilter = useUIStore((s) => s.activeFilter);

  const items = useCartStore((s) => s.items);
  const observations = useCartStore((s) => s.observations);
  const setObservations = useCartStore((s) => s.setObservations);
  const customerName = useCartStore((s) => s.customerName);
  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const customerPhone = useCartStore((s) => s.customerPhone);
  const setCustomerPhone = useCartStore((s) => s.setCustomerPhone);
  const customerAddress = useCartStore((s) => s.customerAddress);
  const setCustomerAddress = useCartStore((s) => s.setCustomerAddress);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const totalEstimated = useCartStore((s) => s.totalEstimated());
  const clearCart = useCartStore((s) => s.clear);
  const hasAllPrices = items.every((i) => i.unitPrice != null);

  const [sending, setSending] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const businessType = activeFilter.type === "business" ? activeFilter.value : null;

  const nameMissing = showValidation && !customerName.trim();
  const addressMissing = showValidation && !customerAddress.trim();
  const paymentMissing = showValidation && !paymentMethod;

  const handleCheckout = () => {
    if (!customerName.trim() || !customerAddress.trim() || !paymentMethod) {
      setShowValidation(true);
      return;
    }

    setSending(true);
    const message = buildOrderMessage(items, businessType, observations, {
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      paymentMethod,
    });
    const url = buildWhatsappUrl(message);

    // window.open debe llamarse de forma SÍNCRONA, dentro del mismo gesto de
    // clic del usuario — si se retrasa (setTimeout, await, etc.) muchos
    // navegadores móviles lo bloquean silenciosamente como si fuera un
    // pop-up no solicitado. Por eso se abre aquí mismo, antes de cualquier
    // espera, y el pedido se vacía de inmediato: el cliente ya inició el
    // envío, así que la próxima visita debe empezar desde cero.
    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    setShowValidation(false);

    window.setTimeout(() => {
      setSending(false);
      closeCart();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            role="dialog"
            aria-label="Tu pedido"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-[24px] border-t border-white/10 bg-background sm:inset-x-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-l sm:border-t-0"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-lg font-bold text-white">Tu Pedido</h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                  <ShoppingBag className="h-10 w-10 text-white/20" />
                  <p className="text-white">Aún no has agregado productos.</p>
                  <p className="text-sm text-muted">
                    Explora el catálogo y comienza tu pedido.
                  </p>
                  <Button variant="secondary" size="sm" onClick={closeCart}>
                    Volver al catálogo
                  </Button>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <CartLineItem key={`${item.sku}-${item.presentationLabel}`} item={item} />
                  ))}

                  <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                        Tu nombre
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="¿Cómo te llamas?"
                        autoComplete="name"
                        className={cn(
                          "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none",
                          nameMissing
                            ? "border-danger focus:border-danger"
                            : "border-white/10 focus:border-primary",
                        )}
                      />
                      {nameMissing ? (
                        <p className="mt-1 text-xs text-danger">Escribe tu nombre para continuar.</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                        Teléfono (opcional)
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="300 000 0000"
                        autoComplete="tel"
                        className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Dirección de entrega
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Barrio, calle, número, referencia"
                      autoComplete="street-address"
                      className={cn(
                        "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none",
                        addressMissing
                          ? "border-danger focus:border-danger"
                          : "border-white/10 focus:border-primary",
                      )}
                    />
                    {addressMissing ? (
                      <p className="mt-1 text-xs text-danger">Escribe la dirección de entrega para continuar.</p>
                    ) : null}
                  </div>

                  <div className="pb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Método de pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={cn(
                        "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-white focus:outline-none",
                        paymentMissing
                          ? "border-danger focus:border-danger"
                          : "border-white/10 focus:border-primary",
                        paymentMethod ? "" : "text-muted",
                      )}
                    >
                      <option value="" disabled>
                        Selecciona un método de pago
                      </option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method} className="text-white">
                          {method}
                        </option>
                      ))}
                    </select>
                    {paymentMissing ? (
                      <p className="mt-1 text-xs text-danger">Selecciona un método de pago para continuar.</p>
                    ) : null}
                  </div>

                  <div className="pb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="¿Hay alguna indicación especial para preparar tu pedido?"
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-white/[0.06] px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm text-muted">
                  <span>Valor estimado</span>
                  <span className="text-base font-bold text-white">
                    {hasAllPrices ? formatCurrency(totalEstimated) : "Por confirmar"}
                  </span>
                </div>
                <p className="mb-3 text-xs text-muted">
                  El valor mostrado es una referencia. Nuestro asesor confirmará el precio final.
                </p>
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={sending}
                >
                  {sending ? "Preparando pedido..." : "Finalizar pedido por WhatsApp"}
                </Button>
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
