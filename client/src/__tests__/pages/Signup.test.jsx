/**
 * Component Tests for Enhanced Signup Page
 * 
 * Tests signup form rendering, role field removal, user interaction, and API integration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../../pages/Signup';
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
    User: () => <div data-testid="user-icon">User Icon</div>,
    Sparkles: () => <div data-testid="sparkles-icon">Sparkles Icon</div>,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Enhanced Signup Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();

        jest.spyOn(localStorage, 'setItem');

        api.post = jest.fn();
        toast.showSuccess = jest.fn();
        toast.showError = jest.fn();
    });

    describe('UI Rendering', () => {
        it('should render signup form with enhanced design elements', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
            expect(screen.getByText('Join Phantom Cleaning Admin')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

        it('should render all icons', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
            expect(screen.getByTestId('user-icon')).toBeInTheDocument();
            expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
            expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
            expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
        });

        it('should render login link', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            expect(screen.getByText('Already have an account?')).toBeInTheDocument();
            expect(screen.getByText('Sign in')).toBeInTheDocument();
        });

        it('should NOT render role selection field', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            // Verify no select element exists
            const selectElements = screen.queryAllByRole('combobox');
            expect(selectElements).toHaveLength(0);

            // Verify no role-related text
            expect(screen.queryByText('Super Admin')).not.toBeInTheDocument();
            expect(screen.queryByText('Manager')).not.toBeInTheDocument();
            expect(screen.queryByText('Cleaner')).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
        });

        it('should only have 3 input fields (name, email, password)', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            const inputs = screen.getAllByRole('textbox');
            const passwordInputs = screen.getAllByPlaceholderText('Password');

            // 2 textboxes (name, email) + 1 password field = 3 total
            expect(inputs.length + passwordInputs.length).toBe(3);
        });
    });

    describe('Form Interactions', () => {
        it('should update name input value', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            const nameInput = screen.getByPlaceholderText('Full name');
            fireEvent.change(nameInput, { target: { value: 'John Doe' } });

            expect(nameInput.value).toBe('John Doe');
        });

        it('should update email input value', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText('Email address');
            fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

            expect(emailInput.value).toBe('john@example.com');
        });

        it('should update password input value', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            expect(passwordInput.value).toBe('password123');
        });

        it('should toggle password visibility with icon buttons', () => {
            render(
                <BrowserRouter>
                    <Signup />
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

        it('should require all fields', () => {
            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            const nameInput = screen.getByPlaceholderText('Full name');
            const emailInput = screen.getByPlaceholderText('Email address');
            const passwordInput = screen.getByPlaceholderText('Password');

            expect(nameInput).toBeRequired();
            expect(emailInput).toBeRequired();
            expect(passwordInput).toBeRequired();
        });
    });

    describe('API Integration', () => {
        it('should call API with default role "Admin" on form submit', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: {
                        id: '123',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin'
                    }
                }
            };

            api.post.mockResolvedValue(mockResponse);

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/auth/signup', {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'Admin'
                });
            });
        });

        it('should store token in localStorage on successful signup', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: {
                        id: '123',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin'
                    }
                }
            };

            api.post.mockResolvedValue(mockResponse);

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
            });
        });

        it('should show success message on successful signup', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: {
                        id: '123',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin'
                    }
                }
            };

            api.post.mockResolvedValue(mockResponse);

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(toast.showSuccess).toHaveBeenCalledWith('Account created successfully!');
            });
        });

        it('should navigate to home page on successful signup', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: {
                        id: '123',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin'
                    }
                }
            };

            api.post.mockResolvedValue(mockResponse);

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
            });
        });

        it('should show error message on signup failure', async () => {
            const mockError = {
                response: {
                    data: {
                        message: 'Email already exists'
                    }
                }
            };

            api.post.mockRejectedValue(mockError);

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'existing@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(toast.showError).toHaveBeenCalledWith('Email already exists');
            });
        });

        it('should show generic error on failure without message', async () => {
            api.post.mockRejectedValue(new Error('Network error'));

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(toast.showError).toHaveBeenCalledWith('Signup failed');
            });
        });
    });

    describe('Loading States', () => {
        it('should show loading state during API call', async () => {
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            expect(screen.getByText('Creating account...')).toBeInTheDocument();
        });

        it('should disable button during loading', async () => {
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(
                <BrowserRouter>
                    <Signup />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('Full name'), {
                target: { value: 'John Doe' }
            });
            fireEvent.change(screen.getByPlaceholderText('Email address'), {
                target: { value: 'john@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText('Password'), {
                target: { value: 'password123' }
            });

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            expect(submitButton).toBeDisabled();
        });
    });
});
