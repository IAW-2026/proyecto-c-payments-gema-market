/* UniHousing — Datos compartidos (mock) */

export const UH_CATEGORIES = [
  { id: "living", name: "Living", icon: "sofa" },
  { id: "dormitorio", name: "Dormitorio", icon: "bed" },
  { id: "comedor", name: "Comedor", icon: "chef" },
  { id: "cocina", name: "Cocina", icon: "chef" },
  { id: "bath", name: "Baño", icon: "bath" },
  { id: "terraza", name: "Terraza", icon: "leafDeco" },
  { id: "decoracion", name: "Decoración", icon: "flower" },
];

export const UH_PRODUCTS = [
  { id: "p1", title: "Sillón de pana 2 cuerpos", price: 89000, oldPrice: 110000, seller: "Hogar Pampeano", sellerId: "s1", rating: 4.8, reviews: 32, category: "living", glyph: "living", palette: ["#a4ac86","#414833"], stock: 3, condition: "Usado · Como nuevo", location: "Bahía Blanca", shipping: 4500, dims: "180×85×90 cm" },
  { id: "p2", title: "Mesa de luz roble", price: 24500, seller: "Carpintería Sur", sellerId: "s2", rating: 4.9, reviews: 71, category: "dormitorio", glyph: "dormitorio", palette: ["#936639","#582f0e"], stock: 8, condition: "Nuevo", location: "Bahía Blanca", shipping: 2800, dims: "45×40×55 cm" },
  { id: "p3", title: "Lámpara de pie mimbre", price: 18900, seller: "La Lámpara", sellerId: "s3", rating: 4.6, reviews: 18, category: "decoracion", glyph: "decoracion", palette: ["#b6ad90","#7f4f24"], stock: 5, condition: "Nuevo", location: "Bahía Blanca", shipping: 2200, dims: "40×40×160 cm" },
  { id: "p4", title: "Juego de sábanas king", price: 32000, seller: "Textil Hogar", sellerId: "s4", rating: 4.7, reviews: 124, category: "dormitorio", glyph: "dormitorio", palette: ["#c2c5aa","#656d4a"], stock: 22, condition: "Nuevo", location: "Bahía Blanca", shipping: 1800, dims: "Varios" },
  { id: "p5", title: "Set de vajilla 12 pzs", price: 15600, seller: "Cocina&Co", sellerId: "s5", rating: 4.5, reviews: 56, category: "cocina", glyph: "cocina", palette: ["#a68a64","#414833"], stock: 14, condition: "Nuevo", location: "Bahía Blanca", shipping: 2100, dims: "12 piezas" },
  { id: "p6", title: "Mesa redonda 4 personas", price: 67000, seller: "Carpintería Sur", sellerId: "s2", rating: 4.8, reviews: 41, category: "comedor", glyph: "comedor", palette: ["#7f4f24","#582f0e"], stock: 2, condition: "Nuevo", location: "Bahía Blanca", shipping: 5200, dims: "Ø100×75 cm" },
  { id: "p7", title: "Cortina de baño bambú", price: 8400, seller: "Casa Verde", sellerId: "s6", rating: 4.4, reviews: 22, category: "bath", glyph: "bath", palette: ["#a4ac86","#333d29"], stock: 30, condition: "Nuevo", location: "Bahía Blanca", shipping: 1500, dims: "180×200 cm" },
  { id: "p8", title: "Reposera plegable lona", price: 22500, seller: "Patio&Jardín", sellerId: "s7", rating: 4.7, reviews: 38, category: "terraza", glyph: "terraza", palette: ["#656d4a","#a68a64"], stock: 6, condition: "Nuevo", location: "Bahía Blanca", shipping: 2900, dims: "60×80×90 cm" },
  { id: "p9", title: "Espejo redondo 60cm", price: 16800, seller: "La Lámpara", sellerId: "s3", rating: 4.6, reviews: 27, category: "decoracion", glyph: "decoracion", palette: ["#b6ad90","#414833"], stock: 9, condition: "Nuevo", location: "Bahía Blanca", shipping: 2400, dims: "Ø60 cm" },
  { id: "p10", title: "Estantería pino 4 niveles", price: 38900, seller: "Carpintería Sur", sellerId: "s2", rating: 4.9, reviews: 88, category: "living", glyph: "living", palette: ["#936639","#7f4f24"], stock: 4, condition: "Nuevo", location: "Bahía Blanca", shipping: 3500, dims: "80×30×160 cm" },
  { id: "p11", title: "Pava eléctrica 1.7L", price: 19200, seller: "Cocina&Co", sellerId: "s5", rating: 4.5, reviews: 102, category: "cocina", glyph: "cocina", palette: ["#a4ac86","#414833"], stock: 18, condition: "Nuevo", location: "Bahía Blanca", shipping: 1900, dims: "1.7 L" },
  { id: "p12", title: "Almohadón lino crudo", price: 6800, seller: "Textil Hogar", sellerId: "s4", rating: 4.7, reviews: 65, category: "decoracion", glyph: "decoracion", palette: ["#b6ad90","#a4ac86"], stock: 40, condition: "Nuevo", location: "Bahía Blanca", shipping: 1200, dims: "45×45 cm" },
];

export const UH_ORDERS = [
  { id: "OR-2841", date: "22 abr 2026", status: "en_camino", items: 2, total: 113500, buyer: "Lucía M.", address: "Av. Alem 1253, Bahía Blanca", trackId: "TRK-9821" },
  { id: "OR-2840", date: "21 abr 2026", status: "preparando", items: 1, total: 24500, buyer: "Mateo R.", address: "Donado 845, B. Blanca", trackId: "TRK-9820" },
  { id: "OR-2839", date: "20 abr 2026", status: "entregado", items: 3, total: 67400, buyer: "Sofía G.", address: "Brown 510, B. Blanca", trackId: "TRK-9819" },
  { id: "OR-2838", date: "18 abr 2026", status: "pago_pendiente", items: 1, total: 18900, buyer: "Tomás P.", address: "Soler 2230, B. Blanca", trackId: "TRK-9818" },
  { id: "OR-2837", date: "16 abr 2026", status: "entregado", items: 2, total: 41200, buyer: "Camila V.", address: "O'Higgins 1100, B. Blanca", trackId: "TRK-9817" },
];

export const UH_STATUS_LABEL = {
  pago_pendiente: { label: "Pago pendiente", tone: "warn" },
  preparando: { label: "Preparando", tone: "sand" },
  listo_envio: { label: "Listo para envío", tone: "sage" },
  en_camino: { label: "En camino", tone: "forest" },
  entregado: { label: "Entregado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "danger" },
};
