import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingBag, ArrowLeft, Package, Shield, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useState } from "react";
import ShareButtons from "@/components/ShareButtons";

// No fallback products - only show products from database

const categoryLabels = {
  toys: "Juguetes",
  lingerie: "Lencería",
  oils: "Aceites & Geles",
  kits: "Kits Parejas"
};

// Helper function to parse images from JSON
const parseImages = (imagesJson: string): string[] => {
  try {
    const images = JSON.parse(imagesJson);
    return Array.isArray(images) ? images : [imagesJson];
  } catch {
    return [imagesJson];
  }
};

// Helper function to check if string is a URL or gradient class
const isImageUrl = (image: string): boolean => {
  return image.startsWith('http') || image.startsWith('/');
};

export default function ProductDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const productId = parseInt(params.id || "0", 10);
  
  // Load products from database
  const { data: dbProducts, isLoading } = trpc.products.list.useQuery();
  
  // Use database products only
  const products = dbProducts || [];
  
  const product = products.find(p => p.id === productId);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando producto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
              <p className="text-muted-foreground mb-6">
                El producto que buscas no existe o ha sido eliminado.
              </p>
              <Link href="/tienda">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a la Tienda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const images = parseImages(product.images);
  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    const imageToUse = isImageUrl(currentImage) ? currentImage : "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80";
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: imageToUse,
      category: product.category
    });
    toast.success("Producto agregado al carrito", {
      description: `${product.name} se ha añadido correctamente.`
    });
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const renderProductImage = (image: string) => {
    if (isImageUrl(image)) {
      return (
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return <div className={`w-full h-full ${image}`}></div>;
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-20">
        {/* Breadcrumb */}
        <div className="bg-neutral-950 border-b border-white/5">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/tienda" className="hover:text-white transition-colors">Tienda</Link>
              <span>/</span>
              <span className="text-white">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/tienda">
              <Button variant="outline" className="border-primary/30 hover:border-primary text-neutral-700 hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la Tienda
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <Card className="overflow-hidden border-white/10 bg-neutral-900/50">
                <CardContent className="p-0 relative">
                  <div className="aspect-square relative">
                    {renderProductImage(currentImage)}
                    {product.tag && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        {product.tag}
                      </Badge>
                    )}
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className={`w-full h-full ${isImageUrl(image) ? "bg-neutral-900" : ""}`}>
                        {isImageUrl(image) ? (
                          <img
                            src={image}
                            alt={`${product.name} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${image}`}></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="mb-4">
                <Badge variant="outline" className="mb-3">
                  {categoryLabels[product.category]}
                </Badge>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-neutral-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.reviews} reseñas
                  </span>
                </div>

                <div className="text-4xl font-bold text-primary mb-6">
                  ${product.price.toLocaleString('es-CO')}
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {product.description || "Una experiencia sensorial única diseñada para el placer consciente."}
                </p>
              </div>

              <div className="mb-8">
                <Button
                  size="lg"
                  className="w-full text-lg h-14"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Agregar al Carrito
                </Button>
              </div>

              {/* Share Buttons */}
              <div className="mb-8">
                <ShareButtons 
                  productName={product.name}
                  productId={product.id}
                  productPrice={product.price}
                />
              </div>

              {/* Features */}
              <Card className="bg-neutral-900/30 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Compra Segura</h3>
                        <p className="text-sm text-muted-foreground">
                          Transacciones encriptadas y datos protegidos
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Envío Discreto</h3>
                        <p className="text-sm text-muted-foreground">
                          Empaque neutral sin identificación del contenido
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Calidad Premium</h3>
                        <p className="text-sm text-muted-foreground">
                          Productos certificados y materiales de grado médico
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
