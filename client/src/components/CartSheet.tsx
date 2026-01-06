import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { openWhatsApp } from "@/lib/whatsapp";
import ShippingForm from "@/components/ShippingForm";
import { useState } from "react";

interface CartSheetProps {
  trigger?: React.ReactNode;
  compact?: boolean;
}

export default function CartSheet({ trigger, compact = false }: CartSheetProps) {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const [showShippingForm, setShowShippingForm] = useState(false);

  const handleCheckout = () => {
    const itemsList = items.map(item => 
      `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toLocaleString('es-CO')}`
    ).join('\n');
    
    const message = `Hola, quiero realizar el siguiente pedido:\n\n${itemsList}\n\nTotal: $${totalPrice.toLocaleString('es-CO')}\n\n¿Me ayudan con el proceso de pago y envío?`;
    
    openWhatsApp(message);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="default" 
            className={`rounded-full bg-[#631cce] hover:bg-[#5014a8] text-white flex items-center gap-2 ${compact ? 'px-3' : 'px-4'}`}
          >
            {!compact && <span>Ver Carrito</span>}
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-serif text-2xl">
            {showShippingForm ? "Datos de Envío" : `Tu Carrito (${totalItems})`}
          </SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-6">¡Descubre nuestros productos y añade un poco de placer a tu vida!</p>
            <Button onClick={() => setIsCartOpen(false)} variant="outline">
              Seguir Comprando
            </Button>
          </div>
        ) : !showShippingForm ? (
          <div className="flex flex-col h-full overflow-hidden">
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 py-6 px-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">${item.price.toLocaleString('es-CO')}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-white dark:hover:bg-neutral-700 hover:text-foreground transition-all shadow-sm"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center tabular-nums">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-white dark:hover:bg-neutral-700 hover:text-foreground transition-all shadow-sm"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t px-6 py-4 space-y-4 flex-shrink-0 bg-background">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Estimado</span>
                <span>${totalPrice.toLocaleString('es-CO')}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Completa tus datos de envío para procesar tu pedido.
              </p>
              <Button 
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white"
                onClick={() => setShowShippingForm(true)}
              >
                Continuar con Envío
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <ScrollArea className="flex-1 min-h-0">
              <div className="py-6 px-6 space-y-4">
                <ShippingForm />
              </div>
            </ScrollArea>
            
            <div className="border-t px-6 py-4 flex-shrink-0 bg-background">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setShowShippingForm(false)}
              >
                Volver al Carrito
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
