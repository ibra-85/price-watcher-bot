import { getDbPool } from "../db/connection";

export interface TrackedProduct {
  id: number;
  name: string;
  url: string;
  targetPrice: number;
  channelId: string;
  userId: string;
  createdAt: Date;
}

export interface NewProduct {
  name: string;
  url: string;
  targetPrice: number;
  channelId: string;
  userId: string;
}

export interface ProductsRepository {
  add(product: NewProduct): Promise<TrackedProduct>;
  list(): Promise<TrackedProduct[]>;
  getAll(): Promise<TrackedProduct[]>;
  getById(id: number): Promise<TrackedProduct | null>;
  remove(id: number): Promise<boolean>;
  listByUser(userId: string): Promise<TrackedProduct[]>;
}

function mapRow(row: any): TrackedProduct {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    targetPrice: Number(row.target_price),
    channelId: row.channel_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export const productsRepository: ProductsRepository = {
  async add(product: NewProduct): Promise<TrackedProduct> {
    const pool = getDbPool();
    const [result] = await pool.execute(
      `INSERT INTO products (name, url, target_price, channel_id, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        product.name,
        product.url,
        product.targetPrice,
        product.channelId,
        product.userId,
      ]
    );

    const insertId = (result as any).insertId as number;

    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE id = ?`,
      [insertId]
    );

    return mapRow((rows as any[])[0]);
  },

  async list(): Promise<TrackedProduct[]> {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT * FROM products ORDER BY id ASC`
    );
    return (rows as any[]).map(mapRow);
  },

  async getAll(): Promise<TrackedProduct[]> {
    return this.list();
  },

  async getById(id: number): Promise<TrackedProduct | null> {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );
    const arr = rows as any[];
    return arr.length ? mapRow(arr[0]) : null;
  },

  async remove(id: number): Promise<boolean> {
    const pool = getDbPool();
    const [result] = await pool.execute(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );
    return (result as any).affectedRows > 0;
  },

  async listByUser(userId: string): Promise<TrackedProduct[]> {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE user_id = ? ORDER BY id ASC`,
      [userId]
    );
    return (rows as any[]).map(mapRow);
  },
};
