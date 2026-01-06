import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, Star, Filter, Search, ChevronDown, ArrowLeft } from "lucide-react";
import CartSheet from "@/components/CartSheet";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";

const fallbackProducts = [
  {
    id: 1,
    name: "Susurro Púrpura",
    category: "toys" as const,
    price: 1299,
    rating: 5,
    reviews: 128,
    images: JSON.stringify(["bg-gradient-to-tr from-purple-900 to-indigo-900"]),
    tag: "Best Seller",
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Aceite de Masaje Sensual",
    category: "oils" as const,
    price: 450,
    rating: 5,
    reviews: 85,
    images: JSON.stringify(["bg-gradient-to-tr from-amber-700 to-orange-900"]),
    tag: "Nuevo",
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Conjunto de Encaje Negro",
    category: "lingerie" as const,
    price: 899,
    rating: 5,
    reviews: 210,
    images: JSON.stringify(["bg-gradient-to-tr from-neutral-800 to-neutral-950"]),
    tag: null,
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Kit Parejas Aventureras",
    category: "kits" as const,
    price: 2100,
    rating: 5,
    reviews: 45,
    images: JSON.stringify(["bg-gradient-to-tr from-pink-900 to-rose-900"]),
    tag: "Oferta",
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "Vibrador Clásico",
    category: "toys" as const,
    price: 950,
    rating: 5,
    reviews: 92,
    images: JSON.stringify(["bg-gradient-to-tr from-violet-900 to-fuchsia-900"]),
    tag: null,
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: "Vela de Masaje",
    category: "oils" as const,
    price: 380,
    rating: 5,
    reviews: 34,
    images: JSON.stringify(["bg-gradient-to-tr from-red-900 to-orange-800"]),
    tag: null,
    description: null,
    stock: 10,
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "rating" | "nuevos" | "populares";

const CATEGORIES = [
  { id: "all", name: "Todos" },
  { id: "toys", name: "Juguetes" },
  { id: "lingerie", name: "Lencería" },
  { id: "oils", name: "Aceites & Geles" },
  { id: "kits", name: "Kits Parejas" },
];

const SORT_OPTIONS = [
  { value: "relevancia" as SortOption, label: "Relevancia" },
  { value: "precio-asc" as SortOption, label: "Precio: Menor a Mayor" },
  { value: "precio-desc" as SortOption, label: "Precio: Mayor a Menor" },
  { value: "rating" as SortOption, label: "Mejor Calificación" },
  { value: "nuevos" as SortOption, label: "Más Nuevos" },
  { value: "populares" as SortOption, label: "Más Populares" },
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80";

const getFirstImage = (imagesJson: string): string => {
  try {
    const images = JSON.parse(imagesJson);
    return Array.isArray(images) && images.length > 0 ? images[0] : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
};

const isImageUrl = (str: string): boolean => str.startsWith("http") || str.startsWith("/");

export default function Shop() {
  const { addToCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(fallbackProducts);
  const [sortBy, setSortBy] = useState<SortOption>("relevancia");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const { data: dbProducts } = trpc.products.list.useQuery();

  useEffect(() => {
    if (dbProducts && dbProducts.length > 0) {
      setProducts(dbProducts);
    }
  }, [dbProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSortMenu]);

  const getSortLabel = () => {
    return SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || "Ordenar";
  };

  const sortProducts = (productsToSort: typeof products): typeof products => {
    const sorted = [...productsToSort];
    
    switch (sortBy) {
      case "precio-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "precio-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      case "nuevos":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "populares":
        return sorted.sort((a, b) => b.reviews - a.reviews);
      default:
        return sorted;
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    return CATEGORIES.map(cat => ({
      id: cat.id,
      products: sortProducts(
        products
          .filter(p => cat.id === "all" || p.category === cat.id)
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }));
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0f9" }}>
      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" className="border-primary/30 hover:border-primary text-neutral-700 hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Inicio
            </Button>
          </Link>
          <CartSheet compact={true} />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-3">Tienda</h1>
          <p className="text-neutral-600 text-lg">Descubre nuestro catálogo completo de productos seleccionados</p>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full border-0 text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F2A1C8]"
                style={{
                  backgroundColor: "#e8dff5",
                  color: "#1f1f1f",
                }}
              />
              <button
                onClick={() => searchInputRef.current?.focus()}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F2A1C8] hover:text-[#F2A1C8]/80 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-full border border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 transition-colors bg-white"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{getSortLabel()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
              </button>

              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden"
                >
                  <div className="p-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          sortBy === option.value
                            ? "bg-primary/10 text-primary"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex gap-2 bg-transparent border-b border-neutral-300 overflow-x-auto pb-0 h-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="px-4 py-3 rounded-none border-b-2 border-transparent text-neutral-600 hover:text-neutral-800 transition-colors data-[state=active]:border-[#6F42C1] data-[state=active]:text-neutral-900 data-[state=active]:bg-transparent"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredAndSortedProducts.map((catData) => (
              <TabsContent key={catData.id} value={catData.id} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {catData.products.map((product) => {
                    const firstImage = getFirstImage(product.images);
                    return (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="group overflow-hidden border-white/5 bg-neutral-900/30 hover:border-primary/30 transition-all duration-300 h-full flex flex-col relative cursor-pointer">
                          <Link href={`/producto/${product.id}`} className="absolute inset-0 z-0">
                            <span className="sr-only">Ver producto {product.name}</span>
                          </Link>
                          <div className={`aspect-[4/5] relative overflow-hidden z-10 pointer-events-none ${isImageUrl(firstImage) ? 'bg-neutral-900' : firstImage}`}>
                            {isImageUrl(firstImage) && (
                              <img 
                                src={firstImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-auto">
                              <Button 
                                size="icon" 
                                className="rounded-full bg-white text-black hover:bg-white/90 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 relative z-20"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart({
                                    id: product.id.toString(),
                                    name: product.name,
                                    price: product.price,
                                    image: firstImage,
                                    category: product.category
                                  });
                                }}
                              >
                                <ShoppingBag className="w-5 h-5" />
                              </Button>
                              <Button size="icon" className="rounded-full bg-transparent border border-white text-white hover:bg-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 relative z-20">
                                <Heart className="w-5 h-5" />
                              </Button>
                            </div>
                            
                            {product.tag && (
                              <Badge className="absolute top-3 left-3 bg-primary text-white border-none shadow-lg">
                                {product.tag}
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="p-5 flex-grow flex flex-col z-10 pointer-events-none">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{product.rating}</span>
                              </div>
                            </div>
                            <p className="text-neutral-400 text-sm mb-3">
                              {product.reviews} reseñas
                            </p>
                            <div className="mt-auto">
                              <p className="text-primary font-serif text-2xl font-bold">
                                ${(product.price).toLocaleString('es-CO')}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
