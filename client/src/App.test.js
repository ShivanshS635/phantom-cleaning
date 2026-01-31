import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-router-dom
// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Navigate: ({ to }) => <div>Navigate to {to}</div>,
  useNavigate: () => jest.fn()
}));

test('renders app without crashing', () => {
  render(<App />);
  // Just check that the app renders without errors
  expect(screen.getByRole('main') || document.body).toBeTruthy();
});
