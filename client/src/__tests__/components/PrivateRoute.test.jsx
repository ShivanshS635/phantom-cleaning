/**
 * Component Tests for PrivateRoute
 * 
 * Tests route protection based on token presence.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';

// Mock react-router-dom - will use manual mock from __mocks__
jest.mock('react-router-dom');

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render children when token exists', () => {
    localStorage.setItem('token', 'test-token');

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div data-testid="protected-content">Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to login when token does not exist', () => {
    localStorage.removeItem('token');

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div data-testid="protected-content">Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect when token is empty string', () => {
    localStorage.setItem('token', '');

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div data-testid="protected-content">Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});
