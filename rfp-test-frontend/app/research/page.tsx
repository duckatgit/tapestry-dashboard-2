'use client'

import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { 
  Box, 
  Container, 
  Typography, 
  Slider, 
  Button, 
  Grid, 
  Paper, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fetchCompanyData, CompanyData } from '../services/api';
import CompanyMetrics from '@/components/CompanyMetrics';

// Mock data structure based on your Python code
const dentalCompaniesData = [
  [
    {
      "conditions": "average_emp > 3.5000 -> len_prev_debtors <= 1.5000 -> net_assets > -55072.0000 -> max_debtors > 8120.0000 -> total_assets <= 614845.0000 -> current_assets <= 629312.0000 -> prev_current_assets <= 199831.0000 -> min_prev_debtors <= 70294.0000 -> prev_total_assets <= 148341.0000 -> total_assets <= 103298.5000 -> max_prev_creditors <= 35257.0000 -> prev_total_assets > 15909.000",
      "candidates": ['09392705'],
      "similar": ['06025044', '07245126', '09845010', '11550150', '07074469']
    },
    {
      "conditions": "average_emp > 3.5000 -> len_debtors > 1.5000 -> min_debtors > 60789.0000 -> jurisdiction = england-wales -> SIC_code_contains data -> website_traffic_rank < 400000.0000 -> has_API_product = True -> prev_cash <= 934449.0000",
      "candidates": ['06512755'],
      "similar": ['07387595', '06391181', '06923384', '00488051', '00194318']
    },
    {
      "conditions": "average_emp > 3.5000 -> len_debtors <= 1.5000 -> net_assets > -55072.0000 -> max_debtors > 8120.0000 -> total_assets <= 614845.0000",
      "candidates": ['13209628'],
      "similar": ['09634459']
    }
  ],
  // ... other groups from your data
  [
    {
      "conditions": "average_emp > 3.5000 -> len_debtors > 1.5000 -> min_debtors > 60789.0000 -> jurisdiction_england-wales > 0.5000 -> prev_current_assets > 165679.5000 -> current_assets > 247669.5000 -> min_equity > 1.5000 -> prev_cash <= 934449.0000",
      "candidates": ['07158006', '09410808', '08818278'],
      "similar": ['05074028', '11678745', '02113867', '13985876', '07139723', '07841904', '07247779', '11374129', '05965639', '08661326', '07108862']
    },
    // ... other conditions
  ],
  [
    {
      "conditions": "average_emp > 3.5000 -> len_debtors <= 1.5000 -> net_assets > -55072.0000 -> max_debtors > 8120.0000 -> total_assets <= 614845.0000",
      "candidates": ['09437719', 'NI606626', '10107906', '13265181', '03586592', '12890901', '08962716', '06512755', '07282134', '07294323', '06819367', '11575225', 'NI608788', '10865572', 'NI073324', '10883748', '05147324', '06057361', '04393732', 'NI023309', '05958847', '11760808', '08997777', '05314158', '07561034', '08443417', '11558047', '06170496', '09265281', '10821955', '06702508', '09231793', '12957936', '11887697', '11733635', '06380718', '13955672', '11699401', '11189854', '09875210', '10148000', '07995316', '04811418', '11902752', '13209628'],
      "similar": ['07387595', '06025044', '07245126', '09845010', '11550150', '06483441', '12807523', '06391181', '05992508', '06545266', '13870666', '10657210', '10602530', '06923384', 'SC710724', '07074469', '00488051', '07777109', '06785058', '13577900', '00194318', '03875247', '13049365', '09892856', '08325103', '14016917', '05915346', '13206246', '09456747', '09634459', '13647333']
    },
    // ... other conditions
  ]
];

// Create a dark theme that matches your other pages
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f97316',
      light: '#fdba74',
      dark: '#ea580c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#7dd3fc',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e293b',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.375rem',
          fontWeight: 500,
          boxShadow: 'none',
        },
        contained: {
          backgroundColor: '#f97316',
          '&:hover': {
            backgroundColor: '#ea580c',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#f97316',
          height: 4,
        },
        thumb: {
          height: 14,
          width: 14,
          backgroundColor: '#fff',
        },
        track: {
          height: 4,
          borderRadius: 2,
        },
        rail: {
          height: 4,
          borderRadius: 2,
          opacity: 0.3,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(249, 115, 22, 0.15)',
          color: '#fdba74',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.25)',
          },
        },
      },
    },
  },
});

export default function ResearchPage() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [conditionIndex, setConditionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  const selectedGroup = dentalCompaniesData[groupIndex] || [];
  const selectedCondition = selectedGroup[conditionIndex] || { conditions: '', candidates: [], similar: [] };

  const handleFetchCompany = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await fetchCompanyData(companyId);
      setCompanyData(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        color: 'text.primary',
        pb: 8
      }}>
        {/* Header with gradient background */}
        <Box sx={{ 
          background: 'linear-gradient(to right, #0f172a, #1e293b)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          py: 2,
          mb: 4
        }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/TL.png"
                  alt="Twisted Loop Logo"
                  width={40}
                  height={40}
                  style={{ marginRight: '16px' }}
                />
                <Box>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                    Research Platform
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered investment research
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                color="primary"
                href="/"
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                sx={{ 
                  borderColor: 'rgba(249, 115, 22, 0.5)',
                  color: 'primary.light',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(249, 115, 22, 0.1)',
                  }
                }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Main content */}
        <Container maxWidth="xl">
          {/* Logo display with dark theme */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 6, 
            position: 'relative'
          }}>
            {/* Decorative geometric shapes */}
            <Box sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '150px',
              height: '150px',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
              zIndex: 0,
              animation: 'float 8s ease-in-out infinite',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-10px) rotate(5deg)' },
                '100%': { transform: 'translateY(0px) rotate(0deg)' }
              }
            }} />
            
            <Box sx={{
              position: 'absolute',
              bottom: '15%',
              right: '8%',
              width: '120px',
              height: '120px',
              borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
              background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)',
              zIndex: 0,
              animation: 'float2 10s ease-in-out infinite',
              '@keyframes float2': {
                '0%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(10px) rotate(-5deg)' },
                '100%': { transform: 'translateY(0px) rotate(0deg)' }
              }
            }} />
            
            {/* Dark themed card with logo */}
            <Box 
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '750px',
                px: 3
              }}
            >
              <Paper 
                elevation={4} 
                sx={{ 
                  bgcolor: 'background.paper', 
                  p: { xs: 3, md: 5 },
                  borderRadius: 3,
                  width: '100%',
                  maxWidth: '750px',
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #f97316, #fdba74)',
                  }
                }}
              >
                <Image
                  src="/HPA.png"
                  alt="HPA Logo"
                  width={220}
                  height={140}
                  priority
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                />
              </Paper>
            </Box>
          </Box>

          {/* Model Settings - Full Width */}
          <Paper sx={{ p: 4, mb: 4, width: '100%' }}>
            <Typography variant="h4" gutterBottom>Model Settings</Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3, width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Complexity Level</Typography>
                  <Slider
                    value={groupIndex}
                    onChange={(_, value) => setGroupIndex(value as number)}
                    max={dentalCompaniesData.length - 1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ width: '100%', maxWidth: 'none' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85rem' }}>
                    Controls the depth of the decision tree. Higher values create more specific company matches.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3, width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Model Version</Typography>
                  <Slider
                    value={conditionIndex}
                    onChange={(_, value) => setConditionIndex(value as number)}
                    max={selectedGroup.length - 1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ width: '100%', maxWidth: 'none' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85rem' }}>
                    Selects different branches of the decision tree for alternative investment candidates.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(249, 115, 22, 0.1)', 
              borderRadius: 1,
              border: '1px solid rgba(249, 115, 22, 0.2)',
              mt: 2,
              width: '100%'
            }}>
              <Typography variant="body2" sx={{ color: 'primary.light' }}>
                <strong>How it works:</strong> This model uses decision trees trained on financial data to identify companies with similar characteristics to successful investments.
              </Typography>
            </Box>
          </Paper>

          {/* Selected Model - Already Full Width */}
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>Selected Model</Typography>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Decision Path:</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: 1,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto'
                }}
              >
                {selectedCondition.conditions}
              </Paper>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Primary Candidates</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCondition.candidates.map((id) => (
                    <Chip 
                      key={id}
                      label={id}
                      onClick={() => handleFetchCompany(id)}
                      sx={{ 
                        bgcolor: 'primary.dark',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.main',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Similar Companies</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCondition.similar.map((id) => (
                    <Chip 
                      key={id}
                      label={id}
                      onClick={() => handleFetchCompany(id)}
                      variant="outlined"
                      sx={{ 
                        borderColor: 'rgba(249, 115, 22, 0.5)',
                        color: 'primary.light',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(249, 115, 22, 0.1)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Company Data Section */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : companyData ? (
            <Paper sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">{companyData.name}</Typography>
                <Chip 
                  label={companyData.id} 
                  sx={{ bgcolor: 'rgba(249, 115, 22, 0.2)', color: 'primary.light' }}
                />
              </Box>
              
              <Divider sx={{ mb: 4 }} />
              
              <Box sx={{ mb: 5 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  Company Summary
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {companyData.summary}
                </Typography>
              </Box>
              
              {companyData.metrics && (
                <CompanyMetrics metrics={companyData.metrics} />
              )}
              
              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom>
                    Company Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Domain</Typography>
                    <Typography variant="body1">{companyData.domain}</Typography>
                  </Box>
                  {companyData.linkedIn && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">LinkedIn</Typography>
                      <Typography variant="body1">
                        <a 
                          href={companyData.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: theme.palette.primary.main, 
                            textDecoration: 'none',
                          }}
                        >
                          View LinkedIn Profile
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom>
                    Key Contacts
                  </Typography>
                  {companyData.contacts && companyData.contacts.length > 0 ? (
                    <Box>
                      {companyData.contacts.map((contact, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.position}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.light' }}>
                            {contact.email}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No contact information available
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  Outreach Email Template
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: 1,
                    whiteSpace: 'pre-line',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  {companyData.email}
                </Paper>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17H12.01" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography variant="h5" gutterBottom>Select a Company</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto' }}>
                Click on any company ID from the Primary Candidates or Similar Companies to view detailed information.
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}