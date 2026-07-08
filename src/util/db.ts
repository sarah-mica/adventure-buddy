import { LOCK, Transaction } from "sequelize";

export interface TransactionOptions {
    transaction?: Transaction;
    lock?: LOCK.SHARE | LOCK.UPDATE;
}
