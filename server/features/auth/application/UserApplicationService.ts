import { UserRepository } from '../repository/UserRepository';
import { AuthService } from '../domain/AuthService';
import { User } from '../../../entity/User';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

export class UserApplicationService {
  private userRepository: UserRepository;
  private authService: AuthService;

  constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await this.authService.hashPassword(input.password);
    
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    const token = this.authService.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.authService.comparePassword(input.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.authService.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}
