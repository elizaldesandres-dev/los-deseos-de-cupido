import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Search } from "lucide-react";
import CartSheet from "./CartSheet";
import { openWhatsApp } from "@/lib/whatsapp";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Inicio", href: "#hero" },
    { label: "Tienda", href: "/tienda" },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("/")) {
      window.location.href = href;
    } else {
      // Check if we are on the home page
      if (window.location.pathname === "/") {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // If not on home page, navigate to home and then scroll
        window.location.href = `/${href}`;
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("#hero")}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-serif text-xl font-bold tracking-wide">
              Los Deseos De Cupido
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
              >
                {item.label}
              </button>
            ))}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary"
              onClick={() => {
                window.location.href = "/tienda?focus=search";
              }}
            >
              <Search className="w-5 h-5" />
            </Button>
            <CartSheet />
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              onClick={() => openWhatsApp()}
            >
              Contacto
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary"
              onClick={() => {
                window.location.href = "/tienda?focus=search";
              }}
            >
              <Search className="w-5 h-5" />
            </Button>
            <CartSheet compact={true} />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-white/10">
                <VisuallyHidden>
                  <SheetTitle>Menú de Navegación</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-8 mt-10">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="text-lg font-serif font-medium text-left hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full mt-4"
                    onClick={() => openWhatsApp()}
                  >
                    Contacto WhatsApp
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>
      <WhatsAppFloat />

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-serif text-lg font-bold">Los Deseos De Cupido</span>
          </div>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Estrategia digital diseñada para elevar la marca, construir confianza y convertir visitas en clientes leales.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Descargar PDF
            </Button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Compartir Enlace
            </Button>
          </div>
          <div className="mt-12 text-xs text-muted-foreground/50">
            Generado por Manus AI &bull; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
