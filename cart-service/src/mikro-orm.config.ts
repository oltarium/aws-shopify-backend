import { LoadStrategy, ReflectMetadataProvider } from '@mikro-orm/core';

const config = {
  type: 'postgresql',
  host: process.env.POSTGRESQL_HOST  || "127.0.0.1",
  port: process.env.POSTGRESQL_PORT || 5432,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DB_NAME || "postgres",
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  metadataProvider: ReflectMetadataProvider,
  registerRequestContext: false,
  allowGlobalContext: true,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
};

export default config;
