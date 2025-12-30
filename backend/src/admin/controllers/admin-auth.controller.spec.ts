import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from '../services/admin-auth.service';

describe('AdminAuthController', () => {
    let controller: AdminAuthController;
    let service: AdminAuthService;

    const mockAdminAuthService = {
        login: jest.fn(),
        logout: jest.fn(),
        getProfile: jest.fn(),
        changePassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminAuthController],
            providers: [
                {
                    provide: AdminAuthService,
                    useValue: mockAdminAuthService,
                },
            ],
        }).compile();

        controller = module.get<AdminAuthController>(AdminAuthController);
        service = module.get<AdminAuthService>(AdminAuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('logout', () => {
        it('should call logout service and return success response', async () => {
            const mockReq = {
                user: { sub: 1 },
                ip: '127.0.0.1',
                connection: { remoteAddress: '127.0.0.1' },
                headers: { 'user-agent': 'test-agent' },
            };

            mockAdminAuthService.logout.mockResolvedValue(undefined);

            const result = await controller.logout(mockReq);

            expect(service.logout).toHaveBeenCalledWith(
                1,
                '127.0.0.1',
                'test-agent'
            );
            expect(result).toEqual({
                code: 200,
                message: 'success',
                data: {
                    message: '退出登录成功'
                }
            });
        });
    });
});