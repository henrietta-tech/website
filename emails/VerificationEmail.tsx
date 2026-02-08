import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailWrapper } from './components/EmailWrapper';
import { EmailButton } from './components/EmailButton';
import { EmailFooter } from './components/EmailFooter';

interface VerificationEmailProps {
  firstName?: string;
  verifyUrl: string;
  unsubscribeUrl: string;
}

export const VerificationEmail = ({
  firstName,
  verifyUrl,
  unsubscribeUrl,
}: VerificationEmailProps) => {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  return (
    <EmailWrapper 
      preview="Verify your email to join Henrietta"
      tagline="Henrietta — Yours. Actually."
    >
      <Text style={greetingStyle}>{greeting}</Text>
      
      <Text style={paragraph}>
        You asked to be part of what we are building.
      </Text>
      
      <Text style={paragraph}>
        We do not take that lightly.
      </Text>
      
      <Section style={buttonSection}>
        <EmailButton href={verifyUrl}>Verify my email</EmailButton>
      </Section>
      
      <Text style={signature}>Henrietta</Text>
      
      <Section style={footerSection}>
        <EmailFooter unsubscribeUrl={unsubscribeUrl} />
      </Section>
    </EmailWrapper>
  );
};

const greetingStyle = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 24px',
};

const paragraph = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const buttonSection = {
  margin: '32px 0',
};

const signature = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '32px 0 0',
};

const footerSection = {
  marginTop: '40px',
};

VerificationEmail.PreviewProps = {
  firstName: 'Pedro',
  verifyUrl: 'https://henriettatech.com/verify?token=abc123',
  unsubscribeUrl: 'https://henriettatech.com/unsubscribe?token=xyz789',
};

export default VerificationEmail;
