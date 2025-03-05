import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TransactionType {
  INVESTMENT = 'INVESTMENT',
  REDEMPTION = 'REDEMPTION'
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  investorAddress: string;

  @Column('decimal', { precision: 18, scale: 6 })
  usdAmount: number;

  @Column('decimal', { precision: 18, scale: 6 })
  shares: number;

  @Column('decimal', { precision: 18, scale: 6 })
  sharePrice: number;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @Column()
  transactionHash: string;

  @CreateDateColumn()
  createdAt: Date;
} 