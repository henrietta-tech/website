import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailWrapper } from './components/EmailWrapper';
import { EmailButton } from './components/EmailButton';
import { EmailFooter } from './components/EmailFooter';

interface ReminderFinalEmailProps {
  verifyUrl: string;
  unsubscribeUrl: string;
}

export const ReminderFinalEmail = ({
  verifyUrl,
  unsubscribeUrl,
}: ReminderFinalEmailProps) => (
  <EmailWrapper 
    preview="Final chance to verify your Henrietta signup"
    tagline="Henrietta — Yours. Actually."
  >
    <Text style={greetingStyle}>Hi,</Text>
    
    <Text style={urgentText}>Your signup expires tomorrow.</Text>
    
    <Text style={paragraph}>
      If you still want to join, verify here:
    </Text>
    
    <Section style={buttonSection}>
      <EmailButton href={verifyUrl}>Verify before it expires</EmailButton>
    </Section>
    
    <Text style={mutedParagraph}>
      If not, we will delete your information and you will not hear from us again.
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
  margin: '0 0 8px',
};

const urgentText = {
  color: '#111111',
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: '28px',
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

ReminderFinalEmail.PreviewProps = {
  verifyUrl: 'https://henriettatech.com/verify?token=abc123',
  unsubscribeUrl: 'https://henriettatech.com/unsubscribe?token=xyz789',
};

export default ReminderFinalEmail;
