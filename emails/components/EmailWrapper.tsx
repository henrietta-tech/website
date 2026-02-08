import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface EmailWrapperProps {
  preview: string;
  tagline: string;
  children: React.ReactNode;
}

export const EmailWrapper = ({ preview, tagline, children }: EmailWrapperProps) => (
  <Html>
    <Head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={content}>
          {children}
        </Section>
        
        <Hr style={divider} />
        
        <Text style={taglineStyle}>{tagline}</Text>
      </Container>
    </Body>
  </Html>
);

const body = {
  backgroundColor: '#FAFAFA',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: '540px',
  margin: '0 auto',
  padding: '40px 24px',
};

const content = {
  backgroundColor: '#FAFAFA',
};

const divider = {
  borderColor: '#E5E5E5',
  borderWidth: '1px',
  margin: '40px 0 24px',
};

const taglineStyle = {
  color: '#888888',
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
};

export default EmailWrapper;
