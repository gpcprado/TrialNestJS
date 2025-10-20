// For importing necessary decorators from TypeORM for defining entities and columns
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// For Defining the class as a database entity mapped to the 'users' table
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column()
  role!: string;

  @Column({ nullable: true })
  refresh_token?: string;
}

declare global {
  namespace Express {
    interface Request {
      User?: User | any;
    }
  }
}
