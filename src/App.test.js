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
import Sidebar from './components/Sidebar';
import Collaborators from './components/Collaborators';
import { sendCollaboratorWhatsApp } from './utils/whatsapp';

test('renders the application shell and public pages', () => {
  render(<App />);
  expect(document.querySelector('.App')).toBeInTheDocument();
});

test('Sidebar renders branding as Designer Studio and no search button', () => {
  const { container } = render(<Sidebar onLogout={jest.fn()} />);
  expect(container.querySelector('.sidebar-quick-search-wrap')).toBeNull();
  expect(container.textContent).toContain('Designer Studio');
  expect(container.textContent).not.toContain('Atelier Studio');
  const logo = container.querySelector('.brand-logo');
  expect(logo).toBeInTheDocument();
  expect(logo.getAttribute('alt')).toBe('Naari Art - Designer Studio');
});

test('Collaborators renders in proper mm-app-shell layout without unstyled admin-container', () => {
  const { container } = render(<Collaborators onLogout={jest.fn()} />);
  expect(container.querySelector('.settings-container.mm-app-shell')).toBeInTheDocument();
  expect(container.querySelector('.main-content.mm-main')).toBeInTheDocument();
  expect(container.querySelector('.admin-container')).toBeNull();
});

test('WhatsApp messages use strict brand name Naari Art - Designer Studio', () => {
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
  sendCollaboratorWhatsApp({ fullName: 'Priya', phone: '9825123456' });
  expect(openSpy).toHaveBeenCalled();
  const sentText = decodeURIComponent(openSpy.mock.calls[0][0]);
  expect(sentText).toContain('Naari Art - Designer Studio');
  expect(sentText).not.toContain('Naari Art Atelier');
  openSpy.mockRestore();
});
