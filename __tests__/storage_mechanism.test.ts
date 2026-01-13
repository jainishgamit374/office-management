
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAttendanceRecord } from '../lib/attendanceStorage';
import { getUserStorageKey, savePunchInLocally } from '../lib/localAttendance';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
}));

describe('User-Specific Data Storage Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const USER_A_EMAIL = 'alice@company.com';
    const USER_B_EMAIL = 'bob@company.com';

    // The prefix defined in localAttendance.ts
    const PREFIX = '@attendance_records_';

    describe('JWT Token Key Generation', () => {
        // We need to mock the functions from lib/auth that localAttendance uses
        // Since jest.mock is hoisted, we'll setup the mock behavior in the tests

        it('should use user_id from token when available', async () => {
            // We can't easily mock the internal import of 'getAccessToken' inside localAttendance.ts 
            // without using jest.mock('@/lib/auth') at the top level.
            // However, since we are testing implementation details that rely on AsyncStorage 
            // which getAccessToken uses, we can mock AsyncStorage to return a token,
            // AND we need to rely on the real decodeToken (or a polyfill if needed).

            // BUT, since we can't easily generate a valid JWT that passes the real decodeToken 
            // in this environment without a lot of setup, the best approach for THIS specific unit test 
            // is to rely on the fallback we already verified, OR trust the manual verification.

            // Let's try to simulate a token if possible. 
            // The decodeToken function in auth.ts splits by '.', takes the second part, 
            // replaces chars, attob decodes, and parses JSON.

            const payload = JSON.stringify({ user_id: 999 });
            // customized base64 encoding to match the decoding logic if needed, 
            // but standard base64 usually suffices for simple JSON.
            const base64Payload = Buffer.from(payload).toString('base64')
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');

            const fakeToken = `header.${base64Payload}.signature`;

            (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === 'access_token') return Promise.resolve(fakeToken);
                if (key === '@user_email') return Promise.resolve('ignore-me@test.com');
                return Promise.resolve(null);
            });

            // We need to ensure global atob is available if it isn't
            if (!global.atob) {
                global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
            }

            const key = await getUserStorageKey();
            // Expect key to use user_id (999), NOT email
            expect(key).toBe(`${PREFIX}999`);
        });
    });

    describe('getUserStorageKey() (Fallback)', () => {
        it('should generate correct key for User A', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(USER_A_EMAIL);
            const key = await getUserStorageKey();
            expect(key).toBe(`${PREFIX}${USER_A_EMAIL}`);
        });

        it('should generate correct key for User B', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(USER_B_EMAIL);
            const key = await getUserStorageKey();
            expect(key).toBe(`${PREFIX}${USER_B_EMAIL}`);
        });

        it('should properly access AsyncStorage', async () => {
            await getUserStorageKey();
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user_email');
        });
    });

    describe('savePunchInLocally() - Offline Punch Storage', () => {
        it('should save punch-in data to User A\'s specific key', async () => {
            // Setup: Mock User A logged in
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === '@user_email') return Promise.resolve(USER_A_EMAIL);
                return Promise.resolve(null); // No existing records
            });

            // Action: Save Punch
            await savePunchInLocally(23.01, 72.51, false);

            // Verify: setItem called with User A's key
            const expectedKey = `${PREFIX}${USER_A_EMAIL}`;

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                expectedKey,
                expect.stringContaining('"punchIn":')
            );

            // Verify data structure matches User A requirements
            const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
            expect(savedData[0].latitude).toBe(23.01);
        });

        it('should save punch-in data to User B\'s specific key (Isolated Storage)', async () => {
            // Setup: Mock User B logged in
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === '@user_email') return Promise.resolve(USER_B_EMAIL);
                return Promise.resolve(null);
            });

            // Action: Save Punch
            await savePunchInLocally(23.02, 72.52, false);

            // Verify: setItem called with User B's key
            const expectedKey = `${PREFIX}${USER_B_EMAIL}`;
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                expectedKey,
                expect.anything()
            );

            // Ensure it didn't use User A's key
            const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            expect(callArgs[0]).not.toContain(USER_A_EMAIL);
        });
    });

    describe('saveAttendanceRecord() - Attendance History Storage', () => {
        it('should save formatted record to User A\'s storage', async () => {
            // Setup: User A
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
                if (key === '@user_email') return Promise.resolve(USER_A_EMAIL);
                return Promise.resolve(null);
            });

            const date = '2026-05-20';
            const timestamp = new Date().toISOString();

            await saveAttendanceRecord(date, 'IN', timestamp, { latitude: 10, longitude: 10 });

            const expectedKey = `${PREFIX}${USER_A_EMAIL}`;
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                expectedKey,
                expect.stringContaining(`"date":"${date}"`)
            );
        });
    });
});
