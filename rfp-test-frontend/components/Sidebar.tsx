'use client'

import { Box, Typography, Slider, Paper } from '@mui/material';
import Image from 'next/image';

interface SidebarProps {
  groupIndex: number;
  setGroupIndex: (index: number) => void;
  conditionIndex: number;
  setConditionIndex: (index: number) => void;
  maxGroupIndex: number;
  maxConditionIndex: number;
}

const Sidebar = ({ 
  groupIndex, 
  setGroupIndex, 
  conditionIndex, 
  setConditionIndex, 
  maxGroupIndex, 
  maxConditionIndex 
}: SidebarProps) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        position: 'sticky',
        top: '20px'
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Image 
          src="/TL.png" 
          alt="Logo" 
          width={200} 
          height={80} 
          style={{ objectFit: 'contain' }}
        />
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Select Model Complexity
      </Typography>
      <Slider
        value={groupIndex}
        onChange={(_, newValue) => setGroupIndex(newValue as number)}
        step={1}
        marks
        min={0}
        max={maxGroupIndex}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value} (${value === 0 ? 'most' : value === maxGroupIndex ? 'least' : 'medium'} complex)`}
      />
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Select Model Version
      </Typography>
      <Typography variant="body2" gutterBottom>
        We have several different models that find strong investment candidates:
      </Typography>
      <Slider
        value={conditionIndex}
        onChange={(_, newValue) => setConditionIndex(newValue as number)}
        step={1}
        marks
        min={0}
        max={maxConditionIndex}
        valueLabelDisplay="auto"
      />
    </Paper>
  );
};

export default Sidebar; 