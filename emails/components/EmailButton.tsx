import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => (
  <Button style={button} href={href}>
    {children}
  </Button>
);

const button = {
  backgroundColor: '#7B85B8',
  color: '#ffffff',
  padding: '14px 24px',
  borderRadius: '4px',
  fontWeight: 500,
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

export default EmailButton;
