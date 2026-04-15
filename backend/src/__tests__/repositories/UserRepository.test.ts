import { UserRepository } from '../../repositories/UserRepository';
import { Pool } from 'pg';
import { IUser } from '../../interfaces/IUser';

// Mock the database connection
const mockPool = {
  query: jest.fn(),
} as unknown as Pool;

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(mockPool);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        role: 'user',
        isLocked: false,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ 
          id: mockUser.id, 
          username: mockUser.username, 
          password_hash: mockUser.passwordHash, 
          role: mockUser.role, 
          is_locked: mockUser.isLocked, 
          created_at: mockUser.createdAt 
        }],
      });

      const result = await userRepository.findById(1);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found by username', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        role: 'user',
        isLocked: false,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ 
          id: mockUser.id, 
          username: mockUser.username, 
          password_hash: mockUser.passwordHash, 
          role: mockUser.role, 
          is_locked: mockUser.isLocked, 
          created_at: mockUser.createdAt 
        }],
      });

      const result = await userRepository.findByUsername('testuser');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(result).toEqual(mockUser);
    });

    it('should return null when username not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await userRepository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'newuser',
        passwordHash: 'hashedpassword',
        role: 'user',
        isLocked: false,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockUser, created_at: mockUser.createdAt, password_hash: mockUser.passwordHash, is_locked: mockUser.isLocked }],
      });

      const result = await userRepository.create('newuser', 'hashedpassword');

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
        ['newuser', 'hashedpassword']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUsername', () => {
    it('should update username and return updated user', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'updateduser',
        passwordHash: 'hashedpassword',
        role: 'user',
        isLocked: false,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockUser, created_at: mockUser.createdAt, password_hash: mockUser.passwordHash, is_locked: mockUser.isLocked }],
      });

      const result = await userRepository.updateUsername(1, 'updateduser');

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
        ['updateduser', 1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found for update', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await userRepository.updateUsername(999, 'newname');

      expect(result).toBeNull();
    });
  });

  describe('setLocked', () => {
    it('should update lock status and return updated user', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        role: 'user',
        isLocked: true,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockUser, created_at: mockUser.createdAt, password_hash: mockUser.passwordHash, is_locked: mockUser.isLocked }],
      });

      const result = await userRepository.setLocked(1, true);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET is_locked = $1 WHERE id = $2 RETURNING *',
        [true, 1]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('setRole', () => {
    it('should update role and return updated user', async () => {
      const mockUser: IUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        role: 'admin',
        isLocked: false,
        createdAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockUser, created_at: mockUser.createdAt, password_hash: mockUser.passwordHash, is_locked: mockUser.isLocked }],
      });

      const result = await userRepository.setRole(1, 'admin');

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
        ['admin', 1]
      );
      expect(result).toEqual(mockUser);
    });
  });
});
