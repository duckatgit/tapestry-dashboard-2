'use client'

import React from 'react';
import { Box, Typography, LinearProgress, Grid, Paper } from '@mui/material';

interface MetricProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const Metric = ({ label, value, maxValue, color }: MetricProps) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">{value.toLocaleString()}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: color,
          }
        }}
      />
    </Box>
  );
};

interface CompanyMetricsProps {
  metrics: Array<{
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }>;
}

const CompanyMetrics = ({ metrics }: CompanyMetricsProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Financial Metrics
      </Typography>
      <Grid container spacing={2}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Metric {...metric} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CompanyMetrics; 