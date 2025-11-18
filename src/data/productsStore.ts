export interface TrackedProduct {
  id: number;
  name: string;
  url: string;
  targetPrice: number;
  channelId: string;
}

let products: TrackedProduct[] = [];
let nextId = 1;

export const productsStore = {
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
};
