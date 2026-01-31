// Manual mock for react-router-dom
import React from 'react';

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ element }) => <div>{element}</div>;
export const Navigate = ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>;
export const Link = ({ to, children }) => <a href={to}>{children}</a>;
export const useNavigate = () => jest.fn();
export const useParams = () => ({});
export const useLocation = () => ({ pathname: '/' });
