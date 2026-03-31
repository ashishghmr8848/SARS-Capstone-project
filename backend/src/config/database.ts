import dotenv from "dotenv";
import {PrismaClient} from "../../generated/prisma";
import {PrismaPg} from "@prisma/adapter-pg";
import {Pool} from "pg";

dotenv.config();

const globalForPrisma = global as unknown as {prisma: PrismaClient};

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Render free DB allows max 5-10 connections
  min: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000, // Wait up to 10s for a connection
  allowExitOnIdle: false,
});

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["warn", "error"], // Remove "query" and "info" in prod to reduce overhead
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
