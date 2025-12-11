import { UserRepository } from '../repository/UserRepository';
import { SocialAccountRepository } from '../repository/SocialAccountRepository';
import { AuthService } from '../domain/AuthService';
import { User, MembershipGrade } from '../../../entity/User';
import { SocialProvider } from '../../../entity/UserSocialAccount';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  referralId?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface SocialLoginInput {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  name: string;
  profileImage?: string | null;
}

interface SocialLoginResult {
  user: UserResponse;
  token: string;
  isNewUser: boolean;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  referralId: string | null;
  membershipGrade: MembershipGrade;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResult {
  user: UserResponse;
  token: string;
}

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileImage: user.profileImage,
    phone: user.phone,
    birthDate: user.birthDate,
    gender: user.gender,
    referralId: user.referralId,
    membershipGrade: user.membershipGrade,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserApplicationService {
  private userRepository: UserRepository;
  private socialAccountRepository: SocialAccountRepository;
  private authService: AuthService;

  constructor() {
    this.userRepository = new UserRepository();
    this.socialAccountRepository = new SocialAccountRepository();
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
      phone: input.phone || null,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      gender: input.gender || null,
      referralId: input.referralId || null,
    });

    const token = this.authService.generateToken(user.id);
    
    return { user: toUserResponse(user), token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('This account uses social login. Please login with your social account.');
    }

    const isValidPassword = await this.authService.comparePassword(input.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const token = this.authService.generateToken(user.id);
    
    return { user: toUserResponse(user), token };
  }

  async socialLogin(input: SocialLoginInput): Promise<SocialLoginResult> {
    const existingSocialAccount = await this.socialAccountRepository.findByProviderAndProviderId(
      input.provider,
      input.providerUserId
    );

    if (existingSocialAccount) {
      await this.userRepository.update(existingSocialAccount.userId, { lastLoginAt: new Date() });
      const token = this.authService.generateToken(existingSocialAccount.userId);
      return {
        user: toUserResponse(existingSocialAccount.user),
        token,
        isNewUser: false,
      };
    }

    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      await this.socialAccountRepository.create({
        userId: existingUser.id,
        provider: input.provider,
        providerUserId: input.providerUserId,
        emailFromProvider: input.email,
        displayName: input.name,
        profileImage: input.profileImage,
      });

      await this.userRepository.update(existingUser.id, { lastLoginAt: new Date() });

      const token = this.authService.generateToken(existingUser.id);
      return {
        user: toUserResponse(existingUser),
        token,
        isNewUser: false,
      };
    }

    const newUser = await this.userRepository.create({
      email: input.email,
      name: input.name,
      password: null,
      profileImage: input.profileImage,
      isEmailVerified: true,
    });

    await this.socialAccountRepository.create({
      userId: newUser.id,
      provider: input.provider,
      providerUserId: input.providerUserId,
      emailFromProvider: input.email,
      displayName: input.name,
      profileImage: input.profileImage,
    });

    const token = this.authService.generateToken(newUser.id);
    return {
      user: toUserResponse(newUser),
      token,
      isNewUser: true,
    };
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return !!existingUser;
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return null;
    }
    
    return toUserResponse(user);
  }

  async getLinkedSocialAccounts(userId: string) {
    return this.socialAccountRepository.findByUserId(userId);
  }

  async unlinkSocialAccount(userId: string, provider: SocialProvider): Promise<boolean> {
    const accounts = await this.socialAccountRepository.findByUserId(userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (accounts.length === 1 && !user.password) {
      throw new Error('Cannot unlink the only login method. Please set a password first.');
    }

    return this.socialAccountRepository.deleteByUserIdAndProvider(userId, provider);
  }
}
