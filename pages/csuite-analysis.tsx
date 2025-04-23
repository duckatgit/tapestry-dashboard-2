import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  TextField,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// Default questions from your backend
const DEFAULT_QUESTIONS = [
  "What is the name of the company under consideration? Who is the CEO of the company? Have they successfully held CEO positions before?...",
  "Is the current management team fully formed and equipped to deliver on the company's stated strategy?...",
  "How long has the CEO been in their current role?...",
  "What is the level of ambition demonstrated by the CEO and the broader leadership team?...",
  "What is the depth of the executive team?...",
  "What is the website URL of the company?..."
];

const CSuiteAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);

  // Fetch available folders on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get('/api/csuite/folders/');
        setFolders(response.data.folders || []);
        if (response.data.folders?.length > 0) {
          setSelectedFolder(response.data.folders[0]);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchFolders();
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedFolder) {
      alert('Please select a folder first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/csuite/analyze/', {
        questions: questions,
        folder: selectedFolder
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('An error occurred while running the analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomQuestion = () => {
    if (customQuestion.trim()) {
      setQuestions([...questions, customQuestion.trim()]);
      setCustomQuestion('');
    }
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const getScoreColor = (score) => {
    if (!score) return 'gray';
    if (score >= 4) return 'green';
    if (score >= 3) return 'orange';
    return 'red';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        C-Suite Analysis
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Document Folder:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {folders.map((folder) => (
              <Chip 
                key={folder.id}
                label={folder.name}
                onClick={() => setSelectedFolder(folder)}
                color={selectedFolder?.id === folder.id ? "primary" : "default"}
                variant={selectedFolder?.id === folder.id ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Questions for Analysis:
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {questions.map((question, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>
                {index + 1}. {question.length > 100 ? `${question.substring(0, 100)}...` : question}
              </Typography>
              <Button 
                size="small" 
                color="error" 
                onClick={() => handleRemoveQuestion(index)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Add custom question"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button 
            variant="outlined" 
            onClick={handleAddCustomQuestion}
          >
            Add
          </Button>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRunAnalysis}
          disabled={loading || !selectedFolder}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Running Analysis...' : 'Run Analysis'}
        </Button>
      </Paper>

      {results && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Overall Score Summary
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(results).map(([key, data]) => (
                <Grid item xs={6} sm={4} md={2} key={key}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderTop: `4px solid ${getScoreColor(data.score)}`
                    }}
                  >
                    <Typography variant="subtitle2">
                      Question {key.split('_')[1]}
                    </Typography>
                    <Typography variant="h4" sx={{ color: getScoreColor(data.score) }}>
                      {data.score}/5
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {Object.entries(results).map(([key, data]) => (
            <Accordion key={key} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>
                    <strong>Q{key.split('_')[1]}:</strong> {data.question_text.length > 100 
                      ? `${data.question_text.substring(0, 100)}...` 
                      : data.question_text}
                  </Typography>
                  <Chip 
                    label={`Score: ${data.score}/5`}
                    sx={{ 
                      ml: 2, 
                      bgcolor: getScoreColor(data.score),
                      color: 'white'
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="h6" gutterBottom>
                  Analyst Appraisal
                </Typography>
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                  <ReactMarkdown>{data.scoring}</ReactMarkdown>
                </Paper>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>View Source Data</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="h6" gutterBottom>
                      Company Deck (RAG)
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                      <ReactMarkdown>{data.rationale.rag_response}</ReactMarkdown>
                    </Paper>
                    
                    <Typography variant="h6" gutterBottom>
                      Web Search Results
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                      <ReactMarkdown>{data.rationale.web_response}</ReactMarkdown>
                    </Paper>
                    
                    {data.rationale.agent_commentary && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Agent Commentary
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          <ReactMarkdown>{data.rationale.agent_commentary}</ReactMarkdown>
                        </Paper>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default CSuiteAnalysisPage; 