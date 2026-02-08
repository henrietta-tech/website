import { Link } from '@react-email/components';
import * as React from 'react';

interface EmailLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'muted';
}

export const EmailLink = ({ href, children, variant = 'primary' }: EmailLinkProps) => (
  <Link 
    href={href} 
    style={variant === 'primary' ? primaryLink : mutedLink}
  >
    {children}
  </Link>
);

const primaryLink = {
  color: '#111111',
  fontWeight: 500,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const mutedLink = {
  color: '#555555',
  textDecoration: 'underline',
};

export default EmailLink;
