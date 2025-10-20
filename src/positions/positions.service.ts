import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PositionsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async findAll() {
    const [rows] = await this.pool().execute('SELECT * FROM positions');
    return rows;
  }
  async getAll() {
    return this.findAll();
  }

  async delete(position_id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM positions WHERE position_id = ?',
      [position_id],
    );
  }

  async createPositions(position_code: string, position_name: string, id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO positions (position_code, position_name, id) VALUES (?, ?, ?)',
      [position_code, position_name, id?? null]
    );
    return {
      position_id: (result as any).insertId,
      position_code,
      position_name,
      id,
    };
  }

async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, position_code, position_name FROM users WHERE id = ?',
      [id],
    );
    return rows[0];
  }

  async update(position_id: number, data: { position_code?: string; position_name?: string }) {
  const { position_code, position_name } = data;

  const [result]: any = await this.pool().execute(
    'UPDATE positions SET position_code = ?, position_name = ? WHERE position_id = ?',
    [position_code, position_name, position_id]
  );

  if (result.affectedRows === 0) {
    throw new Error(`Position with ID ${position_id} not found`);
  }

  return { position_id, position_code, position_name };
}
}
