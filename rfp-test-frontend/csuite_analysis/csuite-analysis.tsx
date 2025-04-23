// csuite-analysis.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Grid, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import Link from 'next/link';

// Default questions from your backend
const DEFAULT_QUESTIONS = [
  "What is the name of the company under consideration? Who is the CEO of the company? Have they successfully led companies before?",
  "Is the current management team fully formed and equipped to deliver on the company's stated strategy?",
  "How long has the CEO been in their current role?",
  "What is the level of ambition demonstrated by the CEO and the broader leadership team?",
  "What is the depth of the executive team?",
  "What is the website URL of the company?"
];

const CSuiteAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);

  // Fetch available folders on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get('/api/csuite/folders/');
        const folderData = response.data.folders || [];
        setFolders(folderData);
        if (folderData.length > 0) {
          setSelectedFolder(folderData[0]);
        }
        
        // Log folder information for debugging
        console.log('Available folders:', folderData);
      } catch (error) {
        console.error('Error fetching folders:', error);
        // Provide fallback folders if API fails
        const fallbackFolders = [
          { id: 'default', name: 'Default Company Deck' }
        ];
        setFolders(fallbackFolders);
        setSelectedFolder(fallbackFolders[0]);
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
    setResults(null); // Clear previous results
    setAnalysisProgress({ current: 0, total: questions.length }); // Initialize progress
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      const response = await fetch('/api/csuite/analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questions,
          folder: selectedFolder
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Analysis request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream finished.');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the last partial line in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.substring(6); // Remove 'data: '
              const parsedData = JSON.parse(jsonData);

              if (parsedData.type === 'progress') {
                console.log('Progress update:', parsedData);
                setAnalysisProgress({ current: parsedData.current, total: parsedData.total });
              } else if (parsedData.type === 'complete') {
                console.log('Analysis complete:', parsedData.results);
                setResults(parsedData.results);
                setLoading(false); // Stop loading only on completion
                reader.cancel(); // Cancel the reader as we are done
                return; // Exit the loop and function
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError, 'Raw data:', line);
            }
          }
        }
      }
      // If loop finishes without 'complete' message (unexpected)
      if (loading) {
         console.warn('Stream ended without a complete message.');
         setLoading(false);
      }

    } catch (error) {
      console.error('Error running analysis:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
      setAnalysisProgress({ current: 0, total: 0 }); // Reset progress on error
    } 
    // Removed finally block as loading is set within the stream or catch
  };

  // Mock results generator function (for testing)
  const generateMockResults = (questions) => {
    const results = {};
    questions.forEach((question, index) => {
      results[`question_${index+1}`] = {
        question_text: question,
        score: Math.floor(Math.random() * 5) + 1,
        scoring: "This is a mock analysis of the question. The score is based on the available information.",
        sources: {},
        rationale: {
          rag_response: "Mock RAG response for: " + question,
          web_response: "Mock web search results for: " + question,
          agent_commentary: "Mock agent commentary for this question."
        }
      };
    });
    return results;
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

  // Calculate average score
  const calculateAverageScore = () => {
    if (!results) return 0;
    const scores = Object.values(results).map(item => item.score);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return (sum / scores.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/TL.png" alt="Twisted Loop Logo" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-white">C-Suite Analysis</h1>
                <p className="text-sm text-gray-400">Analyzing leadership and management with AI</p>
              </div>
            </div>
            
            {/* Back Button */}
            <div className="flex items-center space-x-3">
              <Link href="/research" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Similar Companies
              </Link>
              
              <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Side-by-side layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Configuration */}
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-6 border border-gray-700 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuration
              </h2>
              
              {/* Document Folder Selection */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-300 mb-3">Select Document Folder:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {folders.map((folder) => (
                    <div 
                      key={folder.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFolder?.id === folder.id 
                          ? 'bg-orange-900/30 border-2 border-orange-500' 
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        console.log('Selecting folder:', folder);
                        setSelectedFolder(folder)
                      }}
                    >
                      <h4 className="font-medium text-white">{folder.name}</h4>
                      {folder.path && (
                        <p className="text-xs text-gray-400 mt-1">Path: {folder.path}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Questions Section */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-300 mb-3">Questions for Analysis:</h3>
                <div className="space-y-2 mb-4">
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <span className="text-sm text-gray-300 flex-1 mr-2">
                        {index + 1}. {question.length > 100 ? `${question.substring(0, 100)}...` : question}
                      </span>
                      <button 
                        className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add custom question"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button 
                    onClick={handleAddCustomQuestion}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-r-lg"
                  >
                    ADD
                  </button>
                </div>
              </div>
              
              {/* Run Analysis Button */}
              <div className="text-center">
                <button
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white', textAlign: 'center', mb: 1 }}>
                        {`Analyzing question ${analysisProgress.current} of ${analysisProgress.total}...`}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysisProgress.total > 0 ? (analysisProgress.current / analysisProgress.total) * 100 : 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)', // Lighter background for contrast
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#ffffff', // White progress bar
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    'RUN ANALYSIS'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - Results */}
          <div className="lg:w-2/3">
            {results ? (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analysis Results
                  </h2>
                  
                  {/* Average Score */}
                  <div className="mb-6 text-center">
                    <div className="inline-block bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Overall Average Score</h3>
                      <div className="text-4xl font-bold text-orange-500">{calculateAverageScore()}/5</div>
                    </div>
                  </div>
                  
                {/* Score Summary */}
                <h3 className="text-lg font-medium text-gray-300 mb-4">Overall Score Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {Object.entries(results).map(([key, data]) => (
                    <div
                    key={key}
                    className="bg-gray-800/50 rounded-lg shadow-inner border border-gray-700 overflow-hidden"
                    >
                    <div className="p-3 text-center">
                        <div className="text-sm font-medium text-gray-400">
                        Question {key.split('_')[1]}
                        </div>
                        <div
                        className={`text-3xl font-bold mt-1 ${
                            data.score >= 4
                            ? 'text-green-500'
                            : data.score >= 3
                            ? 'text-orange-500'
                            : data.score > 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}
                        >
                        {data.score}/5
                        </div>
                    </div>
                    <div
                        className={`h-1 w-full ${
                        data.score >= 4
                            ? 'bg-green-500'
                            : data.score >= 3
                            ? 'bg-orange-500'
                            : data.score > 0
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }`}
                    ></div>
                    </div>
                ))}
                </div>
                  
                  {/* Detailed Results */}
                  <div className="space-y-6">
                    {Object.entries(results).map(([key, data]) => (
                      <div key={key} className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-800/70">
                          <div className="flex items-center">
                            <span className="text-gray-300 font-medium mr-2">Q{key.split('_')[1]}:</span>
                            <span className="text-sm text-gray-400">
                              {data.question_text.length > 100 
                                ? `${data.question_text.substring(0, 100)}...` 
                                : data.question_text}
                            </span>
                          </div>
                          <div 
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              data.score >= 4 ? 'bg-green-500/20 text-green-400' : 
                              data.score >= 3 ? 'bg-orange-500/20 text-orange-400' : 
                              data.score > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            Score: {data.score}/5
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-md font-medium text-orange-400 mb-3">Analyst Appraisal</h4>
                          <div className="bg-gray-800/30 rounded-lg p-4 mb-4 text-gray-300 text-sm">
                            <ReactMarkdown>{data.scoring}</ReactMarkdown>
                          </div>
                          
                          <div className="mt-4">
                            <details className="group">
                              <summary className="flex justify-between items-center cursor-pointer list-none bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70">
                                <h4 className="text-md font-medium text-gray-300">View Source Data</h4>
                                <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7m0 0l7-7 7 7m-7 7h18" />
                                </svg>
                              </summary>
                              <div className="p-4 bg-gray-800/20 rounded-b-lg mt-1 text-sm">
                                <h5 className="text-md font-medium text-gray-300 mb-2">Document Analysis</h5>
                                <div className="bg-gray-800/30 rounded-lg p-3 mb-4 text-gray-400">
                                  <ReactMarkdown>{data.rationale.rag_response}</ReactMarkdown>
                                </div>
                                
                                <h5 className="text-md font-medium text-gray-300 mb-2">Web Search Results</h5>
                                <div className="bg-gray-800/30 rounded-lg p-3 mb-4 text-gray-400">
                                  <ReactMarkdown>{data.rationale.web_response}</ReactMarkdown>
                                </div>
                                
                                {data.rationale.agent_commentary && (
                                  <>
                                    <h5 className="text-md font-medium text-gray-300 mb-2">Agent Commentary</h5>
                                    <div className="bg-gray-800/30 rounded-lg p-3 text-gray-400">
                                      <ReactMarkdown>{data.rationale.agent_commentary}</ReactMarkdown>
                                    </div>
                                  </>
                                )}
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-800/20 rounded-xl border border-gray-700">
                <div className="text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No Analysis Results Yet</h3>
                  <p className="text-gray-500 mb-6">Configure your questions and run the analysis to see results here.</p>
                  <p className="text-gray-600 text-sm">The analysis will evaluate leadership and management based on company documents and web data.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-900 border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {new Date().getFullYear()} Twisted Loop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSuiteAnalysisPage;