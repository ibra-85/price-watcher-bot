import { getDbPool } from "../db/connection";

export interface PriceHistoryEntry {
  id: number;
  productId: number;
  price: number;
  checkedAt: Date;
}

export interface PriceHistoryRepository {
  add(productId: number, price: number): Promise<void>;
  listForProduct(
    productId: number,
    limit?: number
  ): Promise<PriceHistoryEntry[]>;
}

function mapRow(row: any): PriceHistoryEntry {
  return {
    id: row.id,
    productId: row.product_id,
    price: Number(row.price),
    checkedAt: row.checked_at,
  };
}

export const priceHistoryRepository: PriceHistoryRepository = {
  async add(productId: number, price: number): Promise<void> {
    const pool = getDbPool();
    await pool.execute(
      `INSERT INTO price_history (product_id, price) VALUES (?, ?)`,
      [productId, price]
    );
  },

  async listForProduct(
    productId: number,
    limit = 10
  ): Promise<PriceHistoryEntry[]> {
    const pool = getDbPool();

    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));

    const [rows] = await pool.execute(
      `SELECT * FROM price_history
       WHERE product_id = ?
       ORDER BY checked_at DESC
       LIMIT ${safeLimit}`,
      [productId]
    );

    return (rows as any[]).map(mapRow);
  },
};
