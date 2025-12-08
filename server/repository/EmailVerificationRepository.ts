import { Repository } from 'typeorm';
import { AppDataSource } from '../config';
import { EmailVerificationToken } from '../entity';

export class EmailVerificationRepository {
  private repository: Repository<EmailVerificationToken>;

  constructor() {
    this.repository = AppDataSource.getRepository(EmailVerificationToken);
  }

  async create(email: string, code: string, expiresAt: Date): Promise<EmailVerificationToken> {
    const token = this.repository.create({
      email,
      code,
      expiresAt,
      isVerified: false,
    });
    return this.repository.save(token);
  }

  async findLatestByEmail(email: string): Promise<EmailVerificationToken | null> {
    return this.repository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmailAndCode(email: string, code: string): Promise<EmailVerificationToken | null> {
    return this.repository.findOne({
      where: { email, code },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsVerified(id: string): Promise<void> {
    await this.repository.update(id, { isVerified: true });
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.repository.delete({ email });
  }
}
