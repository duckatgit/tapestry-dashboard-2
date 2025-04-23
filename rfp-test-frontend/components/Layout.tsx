'use client'

import Head from 'next/head';
import { Container, Box } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title = 'Machine Learning Company Investment Model' }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="ML-based investment model for companies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout; 