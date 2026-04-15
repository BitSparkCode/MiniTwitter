import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../interfaces/IUser';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../errors';

const BCRYPT_ROUNDS = 10;

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly jwtSecret: string;

  constructor(userRepository: UserRepository, jwtSecret: string) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  public async register(username: string, password: string): Promise<IUser> {
    const existing = await this.userRepository.findByUsername(username);
    if (existing) {
      throw new ConflictError('Username already taken');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return this.userRepository.create(username, passwordHash);
  }

  public async login(username: string, password: string): Promise<string> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    if (user.isLocked) {
      throw new ForbiddenError('Account is locked');
    }
    return this.signToken(user);
  }

  private signToken(user: IUser): string {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }
}
