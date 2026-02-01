/**
 * Component Tests for Enhanced Login Page
 * 
 * Tests login form rendering, user interaction, glassmorphism UI, and API integration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import api from '../../api/axios';
import * as toast from '../../utils/toast';

// Mock dependencies
jest.mock('../../api/axios');
jest.mock('../../utils/toast');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>,
  Lock: () => <div data-testid="lock-icon">Lock Icon</div>,
  Eye: () => <div data-testid="eye-icon">Eye Icon</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff Icon</div>,
  Sparkles: () => <div data-testid="sparkles-icon">Sparkles Icon</div>,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Enhanced Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    jest.spyOn(localStorage, 'setItem');

    api.post = jest.fn();
    toast.showSuccess = jest.fn();
    toast.showError = jest.fn();
  });

  describe('UI Rendering', () => {
    it('should render login form with enhanced design elements', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to Phantom Cleaning Admin')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render all icons', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('should render signup link', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update email input value', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Email address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should toggle password visibility with icon buttons', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Password');

      // Initially password type
      expect(passwordInput.type).toBe('password');
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

      // Click eye icon to show password
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      fireEvent.click(toggleButton);

      expect(passwordInput.type).toBe('text');
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

      // Click eye-off icon to hide password
      const hideButton = screen.getByTestId('eye-off-icon').closest('button');
      fireEvent.click(hideButton);

      expect(passwordInput.type).toBe('password');
    });

    it('should require email and password fields', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('API Integration', () => {
    it('should call API on form submit with valid data', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'Admin'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should store token in localStorage on successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'Admin'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      });
    });

    it('should show success message on successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'Admin'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.showSuccess).toHaveBeenCalledWith('Login successful!');
      });
    });

    it('should navigate to home page on successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'Admin'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should show error message on login failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpassword' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.showError).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('should show generic error on failure without message', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.showError).toHaveBeenCalledWith('Login failed');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during API call', async () => {
      api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('should disable button during loading', async () => {
      api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });
});
