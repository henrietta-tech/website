import { Text, Link } from '@react-email/components';
import * as React from 'react';

interface EmailFooterProps {
  unsubscribeUrl: string;
  showDeleteOption?: boolean;
}

export const EmailFooter = ({ unsubscribeUrl, showDeleteOption = false }: EmailFooterProps) => (
  <>
    <Text style={footerText}>
      If this ever stops feeling relevant, you can{' '}
      <Link href={unsubscribeUrl} style={footerLink}>
        step out here
      </Link>
      .
    </Text>
    
    {showDeleteOption && (
      <Text style={footerText}>
        If you want us to delete everything we have about you, just reply and ask.
      </Text>
    )}
  </>
);

const footerText = {
  color: '#888888',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#7B85B8',
  textDecoration: 'underline',
};

export default EmailFooter;
