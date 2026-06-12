import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminProductListProps {
  onEdit: (productId: number) => void;
  onCreate: () => void;
}

export default function AdminProductList({ onEdit, onCreate }: AdminProductListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.listAll.useQuery();

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente");
      utils.products.listAll.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      toys: "Juguetes",
      lingerie: "Lencería",
      oils: "Aceites & Geles",
      kits: "Kits Parejas",
    };
    return labels[category] || category;
  };

  const getFirstImage = (imagesJson: string): string => {
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) && images.length > 0 ? images[0] : "";
    } catch {
      return imagesJson;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    );
  }

  const [search, setSearch] = useState("");

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    getCategoryLabel(p.category).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold whitespace-nowrap">Gestión de Productos</h2>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <input
            type="text"
            placeholder="Buscar producto o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-64 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {!filtered || filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No hay productos registrados</p>
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Crear primer producto
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const firstImage = getFirstImage(product.images);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden bg-neutral-900">
                        {firstImage && (firstImage.startsWith("http") || firstImage.startsWith("/") || firstImage.startsWith("data:")) ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${firstImage}`}></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{getCategoryLabel(product.category)}</TableCell>
                    <TableCell>${product.price.toLocaleString('es-CO')}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.active === 1 ? "default" : "secondary"}>
                        {product.active === 1 ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente de
              la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
