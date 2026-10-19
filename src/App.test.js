import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    HashRouter: ({ children }) => <div>{children}</div>,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: () => null,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    NavLink: ({ children, to, className, end, ...props }) => {
      const resolvedClass = typeof className === 'function' ? className({ isActive: false }) : className;
      return <a href={to} className={resolvedClass} {...props}>{children}</a>;
    },
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/', search: '' }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
});

jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      create: () => mockAxiosInstance,
      ...mockAxiosInstance,
    },
  };
});

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    internal: { pageSize: { width: 210, height: 297 } },
  }));
});
jest.mock('jspdf-autotable', () => jest.fn());

import App from './App';

test('renders the application shell and public pages', () => {
  render(<App />);
  expect(document.querySelector('.App')).toBeInTheDocument();
});
