import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Heart, 
  Lock, 
  MessageCircle, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  ShoppingBag,
  Eye
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import CartSheet from "@/components/CartSheet";
import { motion } from "framer-motion";
import { openWhatsApp } from "@/lib/whatsapp";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(74,20,140,0.15),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(245,215,227,0.05),transparent_60%)]"></div>
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-4 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-widest uppercase">
              Productos eroticos y sexuales
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Los Deseos <br />
              <span className="text-gradient italic">De Cupido</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Un espacio seguro para descubrir, disfrutar y conectar con el placer femenino y en pareja.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tienda">
                <Button asChild size="lg" className="rounded-full px-8 text-lg h-14 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(74,20,140,0.3)]">
                  <span>Explorar Tienda <ArrowRight className="ml-2 w-5 h-5" /></span>
                </Button>
              </Link>
              <CartSheet trigger={
                <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 border-white/20 hover:bg-white/10 text-white" style={{backgroundColor: '#631cce'}}>
                  <span>Ver Carrito <ShoppingBag className="ml-2 w-5 h-5" style={{backgroundColor: '#631cce'}} /></span>
                </Button>
              } />
            </div>
          </motion.div>
        </div>
      </section>



      {/* Categories Section */}
      <section id="categories" className="py-24" style={{backgroundColor: '#ffd6f6'}}>
        <div className="container px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Explora tus Fantasías</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra selección curada para cada momento de placer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Juguetes", desc: "Vibradores y succionadores", icon: "🍆", color: "from-purple-500/20 to-purple-900/20" },
              { title: "Lencería", desc: "Conjuntos y disfraces", icon: "👙", color: "from-pink-500/20 to-pink-900/20" },
              { title: "Aceites & Geles", desc: "Masajes y lubricantes", icon: "💧", color: "from-blue-500/20 to-blue-900/20" },
              { title: "Kits Parejas", desc: "Juegos y aventuras", icon: "🔥", color: "from-red-500/20 to-red-900/20" }
            ].map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/tienda">
                  <Card className={`glass-panel border-white/5 hover:border-primary/50 transition-all cursor-pointer h-full bg-gradient-to-br ${cat.color}`}>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="text-4xl mb-4">{cat.icon}</div>
                      <h3 className="font-serif text-xl font-bold mb-2">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-black/20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="container px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tu Placer, Nuestro Compromiso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Más que una tienda, somos tu cómplice de confianza.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel border-white/5 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Lock className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Envíos 100% Discretos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Paquetes sin logos ni marcas externas. Nadie sabrá lo que hay dentro, solo tú. Tu privacidad es nuestra prioridad.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5 hover:border-primary/30 transition-colors">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Asesoría Confidencial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ¿Dudas? Nuestras expertas te guían por WhatsApp con total discreción y profesionalismo para elegir lo mejor para ti.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5 hover:border-primary/30 transition-colors">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Pagos Seguros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Transacciones encriptadas y múltiples métodos de pago. Compra con total tranquilidad y seguridad bancaria.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Calidad Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Seleccionamos solo las mejores marcas y materiales seguros para el cuerpo (Body-Safe). Garantía de satisfacción.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Experiencias Reales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lo que dicen quienes ya se atrevieron a descubrir.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "Tenía muchas dudas y vergüenza, pero la asesoría fue increíble. Me sentí súper cómoda y el producto llegó tal cual me dijeron: totalmente discreto.",
                author: "Camila R.",
                location: "Bogotá"
              },
              {
                text: "La calidad es excelente. He comprado en otros sitios y nada que ver. Aquí se nota que cuidan los detalles. El empaque es precioso.",
                author: "Andrea M.",
                location: "Medellín"
              },
              {
                text: "Me encantó la rapidez del envío. Pedí un kit para mi aniversario y llegó justo a tiempo. Mi pareja y yo estamos felices.",
                author: "Sofía L.",
                location: "Cali"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-panel border-white/5 h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Sparkles key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {testimonial.author[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
