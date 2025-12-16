import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: ['server/entity/**/*.ts'],
  migrations: ['server/migrations/**/*.ts'],
});

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database connection established');
  }
  return AppDataSource;
}
