import { Test, TestingModule } from '@nestjs/testing';
import { WinConditionsController } from '../winconditions.controller';
import { R2Service } from '../../../r2/r2.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('WinConditionsController', () => {
  let controller: WinConditionsController;
  let r2Service: R2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WinConditionsController],
      providers: [
        {
          provide: R2Service,
          useValue: {
            uploadFile: jest.fn(),
            listFiles: jest.fn(),
            getFile: jest.fn(),
            deleteFile: jest.fn(),
            updateFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WinConditionsController>(WinConditionsController);
    r2Service = module.get<R2Service>(R2Service);
  });

  describe('createWinCondition', () => {
    it('should create a new win condition', async () => {
      const gameId = '1';
      const body = { condition: 'win' };
      const key = `game-${gameId}/winConditions/test-uuid`;

      (r2Service.uploadFile as jest.Mock).mockResolvedValue({});

      await controller.createWinCondition(gameId, body);

      expect(r2Service.uploadFile).toHaveBeenCalledWith(
        'plock-games',
        key,
        JSON.stringify(body),
      );
    });
  });

  describe('getAllWinConditionsByGame', () => {
    it('should return all win conditions for a game', async () => {
      const gameId = '1';
      const prefix = `game-${gameId}/winConditions/`;
      const keys = ['key1', 'key2'];
      const files = [
        { Body: Buffer.from(JSON.stringify({ condition: 'win1' })) },
        { Body: Buffer.from(JSON.stringify({ condition: 'win2' })) },
      ];

      (r2Service.listFiles as jest.Mock).mockResolvedValue(keys);
      (r2Service.getFile as jest.Mock)
        .mockResolvedValueOnce(files[0])
        .mockResolvedValueOnce(files[1]);

      const result = await controller.getAllWinConditionsByGame(gameId);

      expect(r2Service.listFiles).toHaveBeenCalledWith('plock-games', prefix);
      expect(r2Service.getFile).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { key: 'key1', condition: 'win1' },
        { key: 'key2', condition: 'win2' },
      ]);
    });
  });

  describe('deleteWinCondition', () => {
    it('should delete a win condition', async () => {
      const gameId = '1';
      const id = 'test-uuid';
      const key = `game-${gameId}/winConditions/${id}`;

      (r2Service.deleteFile as jest.Mock).mockResolvedValue({});

      await controller.deleteWinCondition(gameId, id);

      expect(r2Service.deleteFile).toHaveBeenCalledWith('plock-games', key);
    });
  });

  describe('updateWinCondition', () => {
    it('should update a win condition', async () => {
      const gameId = '1';
      const id = 'test-uuid';
      const body = { condition: 'updated-win' };
      const key = `game-${gameId}/winConditions/${id}`;

      (r2Service.updateFile as jest.Mock).mockResolvedValue({});

      await controller.updateWinCondition(gameId, id, body);

      expect(r2Service.updateFile).toHaveBeenCalledWith(
        'plock-games',
        key,
        JSON.stringify(body),
      );
    });
  });
});
