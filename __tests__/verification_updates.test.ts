
import { calculateDistance, isWithinOfficeRadius } from '../lib/attendance';
import { getUpcomingHolidays } from '../lib/calendarEvents';

// Mock dependencies
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(),
    Accuracy: { High: 5 },
}));

jest.mock('expo-device', () => ({
    deviceName: 'Test Device',
    osVersion: '14.0',
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn(),
    },
}));

jest.mock('../lib/api', () => ({
    getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
}));

describe('Verification of Updates', () => {

    // ============================================
    // 1. HOLIDAY CALENDAR UPDATES
    // ============================================
    describe('Holiday Calendar (2 Month Window)', () => {
        beforeAll(() => {
            // Mock System Time to January 1st, 2026
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('should find holidays more than 7 days away (e.g., Uttarayan)', async () => {
            const holidays = await getUpcomingHolidays();
            const holidayNames = holidays.map(h => h.holidayName);

            console.log('Found Holidays:', holidayNames);

            // Uttarayan is Jan 14 (13 days away) - would fail with 7-day logic
            expect(holidayNames).toContain('Uttarayan');

            // Republic Day is Jan 26 (25 days away)
            expect(holidayNames).toContain('Republic Day');
        });
    });

    // ============================================
    // 2. LOCATION RADIUS UPDATE (200m)
    // ============================================
    describe('Location Radius (200m)', () => {
        const OFFICE_COORD = { latitude: 23.0352554, longitude: 72.5616832 };

        it('should reject punch if distance is 220m (previously allowed by 250m limit)', async () => {
            // Helper to generate a point approx N meters north
            // 1 deg lat = approx 111,000 meters. 1m = 1/111000 deg.
            // 220m = 220/111000 = 0.001981 degrees
            const latOffset = 220 / 111111;
            const testLat = OFFICE_COORD.latitude + latOffset;

            // Verify our math first using the actual calc function
            const dist = calculateDistance(
                OFFICE_COORD.latitude, OFFICE_COORD.longitude,
                testLat, OFFICE_COORD.longitude
            );
            console.log(`Calculated test distance: ${dist} meters`);
            expect(dist).toBeGreaterThan(200);
            expect(dist).toBeLessThan(250);

            // Mock implementation to return this specific location
            const Location = require('expo-location');
            Location.getCurrentPositionAsync.mockResolvedValue({
                coords: {
                    latitude: testLat,
                    longitude: OFFICE_COORD.longitude,
                    accuracy: 5
                }
            });

            // Test the function
            const result = await isWithinOfficeRadius();
            console.log('Radius Check Result:', result);

            // Assertion
            expect(result.isWithin).toBe(false);
            expect(result.message).toContain('Must be within 200m');
        });

        it('should allow punch if distance is 180m', async () => {
            const latOffset = 180 / 111111;
            const testLat = OFFICE_COORD.latitude + latOffset;

            const Location = require('expo-location');
            Location.getCurrentPositionAsync.mockResolvedValue({
                coords: {
                    latitude: testLat,
                    longitude: OFFICE_COORD.longitude,
                    accuracy: 5
                }
            });

            const result = await isWithinOfficeRadius();
            expect(result.isWithin).toBe(true);
        });
    });
});
