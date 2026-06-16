import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../config/database.js';
import { MembershipGrade } from '../entity/User.js';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin1234';
const ADMIN_NAME = '관리자';
const SALT_ROUNDS = 10;

export async function ensureAdminUser(): Promise<void> {
  const existingAdmins = await AppDataSource.manager.query(
    'SELECT id FROM users WHERE email = $1 LIMIT 1',
    [ADMIN_EMAIL],
  );

  if (existingAdmins.length > 0) {
    console.log('Admin user already exists, skipping admin bootstrap');
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const adminId = randomUUID();

  await AppDataSource.manager.query(
    `INSERT INTO users (id, email, password, name, "isEmailVerified", "isAdmin", "membershipGrade", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, true, true, $5, NOW(), NOW())
     ON CONFLICT (email) DO NOTHING`,
    [adminId, ADMIN_EMAIL, hashedPassword, ADMIN_NAME, MembershipGrade.BRONZE],
  );

  console.log('Admin user created via bootstrap');
}
