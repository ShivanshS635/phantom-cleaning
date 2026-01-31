
/**
 * Unit Tests for Admin Auth Utility
 * 
 * Tests localStorage-based admin unlock functionality.
 */

// Import AFTER mock is set up - actually, no need to defer import if we use global localStorage
import { unlockAdmin, lockAdmin, isAdminUnlocked } from '../../utils/adminAuth';

describe('Admin Auth Utility', () => {
  beforeEach(() => {
    // Clear the store
    localStorage.clear();
    // Restore mocks if any
    jest.restoreAllMocks();

    // Spy on methods to check calls
    // Note: setupTests.js defines localStorage as an object on window, so we can spy on it.
    jest.spyOn(localStorage, 'getItem');
    jest.spyOn(localStorage, 'setItem');
    jest.spyOn(localStorage, 'removeItem');
  });

  describe('unlockAdmin', () => {
    it('should set admin_unlocked to true in localStorage', () => {
      unlockAdmin();

      expect(localStorage.setItem).toHaveBeenCalledWith('admin_unlocked', 'true');
      expect(localStorage.getItem('admin_unlocked')).toBe('true');
    });
  });

  describe('lockAdmin', () => {
    it('should remove admin_unlocked from localStorage', () => {
      localStorage.setItem('admin_unlocked', 'true');

      lockAdmin();

      expect(localStorage.removeItem).toHaveBeenCalledWith('admin_unlocked');
      expect(localStorage.getItem('admin_unlocked')).toBeNull();
    });
  });

  describe('isAdminUnlocked', () => {
    it('should return true when admin is unlocked', () => {
      localStorage.setItem('admin_unlocked', 'true');

      expect(isAdminUnlocked()).toBe(true);
    });

    it('should return false when admin is locked', () => {
      localStorage.removeItem('admin_unlocked');

      expect(isAdminUnlocked()).toBe(false);
    });

    it('should return false when admin_unlocked is not "true"', () => {
      localStorage.setItem('admin_unlocked', 'false');

      expect(isAdminUnlocked()).toBe(false);
    });
  });
});
