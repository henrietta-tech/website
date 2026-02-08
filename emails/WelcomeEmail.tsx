import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailWrapper } from './components/EmailWrapper';
import { EmailFooter } from './components/EmailFooter';

interface WelcomeEmailProps {
  firstName?: string;
  unsubscribeUrl: string;
}

export const WelcomeEmail = ({
  firstName,
  unsubscribeUrl,
}: WelcomeEmailProps) => {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  return (
    <EmailWrapper 
      preview="Welcome to the Henrietta registry"
      tagline="Henrietta — Asking first, this time."
    >
      <Text style={greetingStyle}>{greeting}</Text>
      
      <Text style={heroText}>You are in.</Text>
      
      <Text style={paragraph}>
        Your email is verified and you are now part of the Henrietta registry.
      </Text>
      
      <Text style={paragraph}>
        We will reach out only when something real happens. A pilot, a finding, 
        or a chance to help shape what we are building.
      </Text>
      
      <Text style={mutedParagraph}>
        Until then, we are heads down working.
      </Text>
      
      <Text style={signature}>Henrietta</Text>
      
      <Section style={footerSection}>
        <EmailFooter unsubscribeUrl={unsubscribeUrl} showDeleteOption={true} />
      </Section>
    </EmailWrapper>
  );
};

const greetingStyle = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 8px',
};

const heroText = {
  color: '#111111',
  fontSize: '22px',
  fontWeight: 500,
  lineHeight: '32px',
  margin: '0 0 32px',
  letterSpacing: '-0.3px',
};

const paragraph = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const mutedParagraph = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
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

WelcomeEmail.PreviewProps = {
  firstName: 'Pedro',
  unsubscribeUrl: 'https://henriettatech.com/unsubscribe?token=xyz789',
};

export default WelcomeEmail;
