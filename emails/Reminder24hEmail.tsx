import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailWrapper } from './components/EmailWrapper';
import { EmailButton } from './components/EmailButton';
import { EmailFooter } from './components/EmailFooter';

interface Reminder24hEmailProps {
  verifyUrl: string;
  unsubscribeUrl: string;
}

export const Reminder24hEmail = ({
  verifyUrl,
  unsubscribeUrl,
}: Reminder24hEmailProps) => (
  <EmailWrapper 
    preview="Finish verifying your Henrietta signup"
    tagline="Henrietta — Built to leave with you."
  >
    <Text style={greetingStyle}>Hi,</Text>
    
    <Text style={paragraph}>
      You started joining the Henrietta registry yesterday but did not 
      finish verifying your email.
    </Text>
    
    <Text style={paragraph}>
      If you still want in, just click below:
    </Text>
    
    <Section style={buttonSection}>
      <EmailButton href={verifyUrl}>Verify my email</EmailButton>
    </Section>
    
    <Text style={mutedParagraph}>
      If not, no action needed. We will remove your information automatically.
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

Reminder24hEmail.PreviewProps = {
  verifyUrl: 'https://henriettatech.com/verify?token=abc123',
  unsubscribeUrl: 'https://henriettatech.com/unsubscribe?token=xyz789',
};

export default Reminder24hEmail;
