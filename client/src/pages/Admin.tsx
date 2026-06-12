import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import AdminProductList from "@/components/AdminProductList";
import AdminProductForm from "@/components/AdminProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ViewMode = "list" | "create" | "edit";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingProductId, setEditingProductId] = useState<number | undefined>();

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container py-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-24">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Debes iniciar sesión para acceder al panel de administración.
              <Button
                variant="link"
                className="ml-2 p-0 h-auto"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Iniciar sesión
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Not admin
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="container py-24">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a esta página. Solo los administradores pueden
              gestionar productos.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Admin view
  return (
    <Layout>
      <div className="container py-12 max-w-7xl">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Panel de Administración</CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "list" && (
              <AdminProductList
                onEdit={(id) => {
                  setEditingProductId(id);
                  setViewMode("edit");
                }}
                onCreate={() => {
                  setEditingProductId(undefined);
                  setViewMode("create");
                }}
              />
            )}

            {(viewMode === "create" || viewMode === "edit") && (
              <AdminProductForm
                productId={editingProductId}
                onSuccess={() => {
                  setViewMode("list");
                  setEditingProductId(undefined);
                }}
                onCancel={() => {
                  setViewMode("list");
                  setEditingProductId(undefined);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
