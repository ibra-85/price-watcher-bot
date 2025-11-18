export interface TrackedProduct {
  id: number;
  name: string;
  url: string;
  targetPrice: number;
  channelId: string;
}

export interface ProductsStore {
  add(product: Omit<TrackedProduct, "id">): TrackedProduct;
  list(): TrackedProduct[];
  getAll(): TrackedProduct[];
  getById(id: number): TrackedProduct | undefined;
  remove(id: number): boolean;
}

let products: TrackedProduct[] = [];
let nextId = 1;

export const productsStore: ProductsStore = {
  add(product: Omit<TrackedProduct, "id">): TrackedProduct {
    const newProduct: TrackedProduct = { id: nextId++, ...product };
    products.push(newProduct);
    return newProduct;
  },

  list(): TrackedProduct[] {
    return products;
  },

  getAll(): TrackedProduct[] {
    return products;
  },

  getById(id: number): TrackedProduct | undefined {
    return products.find((p) => p.id === id);
  },

  remove(id: number): boolean {
    const before = products.length;
    products = products.filter((p) => p.id !== id);
    return products.length < before;
  },
};
