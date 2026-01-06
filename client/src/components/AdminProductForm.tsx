import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, X, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface AdminProductFormProps {
  productId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminProductForm({ productId, onSuccess, onCancel }: AdminProductFormProps) {
  const utils = trpc.useUtils();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "toys" as "toys" | "lingerie" | "oils" | "kits",
    price: "",
    rating: "5",
    reviews: "0",
    images: [] as string[],
    tag: "",
    description: "",
    stock: "0",
    active: "1",
  });

  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(["", "", "", "", ""]);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing product data if editing
  const { data: existingProduct } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  useEffect(() => {
    if (existingProduct) {
      let images: string[] = [];
      try {
        images = JSON.parse(existingProduct.images);
      } catch {
        images = [existingProduct.images];
      }

      // Pad images array to 5 items
      while (images.length < 5) {
        images.push("");
      }

      setFormData({
        name: existingProduct.name,
        category: existingProduct.category,
        price: (existingProduct.price / 100).toString(),
        rating: existingProduct.rating.toString(),
        reviews: existingProduct.reviews.toString(),
        images: images.slice(0, 5),
        tag: existingProduct.tag || "",
        description: existingProduct.description || "",
        stock: existingProduct.stock.toString(),
        active: existingProduct.active.toString(),
      });
      setImagePreviews(images.slice(0, 5));
    }
  }, [existingProduct]);

  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado exitosamente");
      utils.products.listAll.invalidate();
      utils.products.list.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error al crear: ${error.message}`);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      utils.products.listAll.invalidate();
      utils.products.list.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const handleImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar 5MB");
        return;
      }

      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one image
    const hasImages = imagePreviews.some(p => p);
    if (!hasImages) {
      toast.error("Debes subir al menos una imagen");
      return;
    }

    let imageUrls: string[] = [];

    // Upload new images
    setIsUploading(true);
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          // New file to upload
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(",")[1];
              resolve(base64);
            };
          });
          reader.readAsDataURL(imageFiles[i]!);
          const base64Data = await base64Promise;

          const result = await uploadImageMutation.mutateAsync({
            fileName: imageFiles[i]!.name,
            fileData: base64Data,
            mimeType: imageFiles[i]!.type,
          });

          imageUrls.push(result.url);
        } else if (imagePreviews[i] && !imagePreviews[i].startsWith("data:")) {
          // Existing URL
          imageUrls.push(imagePreviews[i]);
        }
      }
    } catch (error) {
      toast.error("Error al subir las imágenes");
      setIsUploading(false);
      return;
    }
    setIsUploading(false);

    // Filter out empty URLs
    imageUrls = imageUrls.filter(url => url);

    if (imageUrls.length === 0) {
      toast.error("Debes subir al menos una imagen válida");
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
      rating: parseInt(formData.rating),
      reviews: parseInt(formData.reviews),
      images: imageUrls,
      tag: formData.tag || null,
      description: formData.description || null,
      stock: parseInt(formData.stock),
      active: parseInt(formData.active),
    };

    if (productId) {
      updateMutation.mutate({ id: productId, ...productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multiple Image Upload */}
          <div className="space-y-4">
            <Label>Imágenes del Producto (máximo 5)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="space-y-2">
                  <div
                    className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-neutral-900"
                    onClick={() => fileInputRefs.current[index]?.click()}
                  >
                    {imagePreviews[index] ? (
                      <img src={imagePreviews[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        {index === 0 ? (
                          <>
                            <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Principal</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">+{index}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(index, e)}
                  />
                  {imagePreviews[index] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const newImageFiles = [...imageFiles];
                        newImageFiles[index] = null;
                        setImageFiles(newImageFiles);

                        const newPreviews = [...imagePreviews];
                        newPreviews[index] = "";
                        setImagePreviews(newPreviews);
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Quitar
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Formatos: JPG, PNG. Máximo 5MB por imagen. La primera imagen será la principal.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toys">Juguetes</SelectItem>
                <SelectItem value="lingerie">Lencería</SelectItem>
                <SelectItem value="oils">Aceites & Geles</SelectItem>
                <SelectItem value="kits">Kits Parejas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Calificación (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews">Número de Reseñas</Label>
              <Input
                id="reviews"
                type="number"
                min="0"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
              />
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <Label htmlFor="tag">Etiqueta (opcional)</Label>
            <Input
              id="tag"
              placeholder="Ej: Best Seller, Nuevo, Oferta"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <Label htmlFor="active">Estado</Label>
            <Select
              value={formData.active}
              onValueChange={(value) => setFormData({ ...formData, active: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Activo</SelectItem>
                <SelectItem value="0">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {productId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
