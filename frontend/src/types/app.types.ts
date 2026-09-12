export interface Category {
  id?: number;
  name: string;
  description?: string | null;
  status?: string;
  parentId?: number | null;
  parentName?: string | null;
  subcategories?: string[];
}

export interface MenuItemTax {
  id?: number;
  name: string;
  rate: number | string;
  menuItemId?: number;
}

export interface RecipeIngredient {
  id?: number;
  name?: string;
  quantity: number | string;
  unit: string;
  menuItemId?: number;
  inventoryId?: number;
}

export interface MenuItem {
  id?: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  price: string | number;
  tax?: number | string | null;
  taxName?: string | null;
  sku?: string | null;
  prepTime?: number | string | null;
  isAvailable?: boolean;
  available?: boolean;
  type?: string; // 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan'
  status?: string; // 'Active' | 'Inactive'
  isAddon?: boolean;
  addonIds?: string | null;
  categoryId?: number;
  category?: string | { id: number; name: string };
  subcategory?: string | null;
  useGlobalTax?: boolean;
  ingredients?: RecipeIngredient[];
  taxes?: MenuItemTax[];
}

export interface Addon {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
}

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string | null;
  itemCount?: number;
  lowStockCount?: number;
}

export interface InventoryHistory {
  id?: number;
  date: string;
  change: string;
  type: string;
  inventoryId?: number;
}

export interface InventoryItem {
  id?: number;
  item: string;
  name?: string;
  unit: string;
  stock: number;
  threshold: number;
  status: string; // 'Good' | 'Low Stock' | 'Out of Stock'
  category?: string;
  categoryId?: number;
  history?: InventoryHistory[];
}

export interface OrderItem {
  id?: number;
  menuItemId?: number;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface OrderPayment {
  id?: number;
  orderId?: number;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  date?: string;
}

export interface Order {
  id: number;
  dailyOrderNumber?: number;
  date: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount?: number;
  balanceAmount?: number;
  status: string;
  description?: string | null;
  items?: OrderItem[];
  payments?: OrderPayment[];
}

export interface Area {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  tables?: Table[];
}

export interface Table {
  id: string | number;
  name: string;
  seats?: number;
  status?: string;
  areaId?: number | null;
}

export interface Settings {
  globalTaxName?: string;
  globalTaxRate?: string;
  [key: string]: any;
}

export interface AppData {
  stats: { orders: number; revenue: string; tables: string };
  categories: (Category | string)[];
  areas: Area[];
  tables: Table[];
  menu: MenuItem[];
  addons: Addon[];
  inventory: InventoryItem[];
  orders?: Order[];
  settings: Settings;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface TableOrderState {
  savedOrders: { items: CartItem[]; time: number }[];
  activeCart: CartItem[];
  payments?: OrderPayment[];
}
