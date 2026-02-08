import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailWrapper } from './components/EmailWrapper';
import { EmailButton } from './components/EmailButton';
import { EmailFooter } from './components/EmailFooter';

interface Reminder72hEmailProps {
  verifyUrl: string;
  unsubscribeUrl: string;
}

export const Reminder72hEmail = ({
  verifyUrl,
  unsubscribeUrl,
}: Reminder72hEmailProps) => (
  <EmailWrapper 
    preview="Last reminder to verify your Henrietta signup"
    tagline="Henrietta — Built to leave with you."
  >
    <Text style={greetingStyle}>Hi,</Text>
    
    <Text style={paragraph}>
      This is our last reminder about your Henrietta signup.
    </Text>
    
    <Text style={paragraph}>
      If you want to be part of what we are building, a patient owned 
      health data registry, you can verify here:
    </Text>
    
    <Section style={buttonSection}>
      <EmailButton href={verifyUrl}>Verify my email</EmailButton>
    </Section>
    
    <Text style={mutedParagraph}>
      Otherwise, your signup will expire and we will delete your information.
    </Text>
    
    <Text style={signature}>Henrietta</Text>
    
    <Section style={footerSection}>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </Section>
  </EmailWrapper>
);

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

const mutedParagraph = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '24px',
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

Reminder72hEmail.PreviewProps = {
  verifyUrl: 'https://henriettatech.com/verify?token=abc123',
  unsubscribeUrl: 'https://henriettatech.com/unsubscribe?token=xyz789',
};

export default Reminder72hEmail;
