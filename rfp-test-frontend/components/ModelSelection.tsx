'use client'

import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ModelSelectionProps {
  conditions: string;
  candidates: string[];
  similarCompanies: string[];
  selectedCandidate: string;
  setSelectedCandidate: (candidate: string) => void;
  loading: boolean;
  onFetchData: () => void;
}

const ModelSelection = ({ 
  conditions, 
  candidates, 
  similarCompanies, 
  selectedCandidate, 
  setSelectedCandidate, 
  loading, 
  onFetchData 
}: ModelSelectionProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Show Selected Condition</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {conditions}
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Candidates:</Typography>
        <Typography>{candidates.join(', ')}</Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Similar Companies:</Typography>
        <Typography>{similarCompanies.join(', ')}</Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Select a candidate company number:</Typography>
        <TextField
          select
          fullWidth
          value={selectedCandidate}
          onChange={(e) => setSelectedCandidate(e.target.value)}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          <option value="">Select a company</option>
          {candidates.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </TextField>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          disabled={!selectedCandidate || loading}
          onClick={onFetchData}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Fetching data...' : `Fetch data for investment candidate ${selectedCandidate}`}
        </Button>
      </Box>
    </Paper>
  );
};

export default ModelSelection; 