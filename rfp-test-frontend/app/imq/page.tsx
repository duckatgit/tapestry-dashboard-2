'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import LoadingState from '@/components/LoadingState'

// Define accepted file types
const ACCEPTED_FILE_TYPES = '.pdf,.docx,.doc,.xlsx,.xls,.zip'

// Add file size validation before upload
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Add this type definition at the top of your file
type UploadedFile = {
  file: File;
  status: 'uploading' | 'success' | 'error';
  message?: string;
};

export default function InfoMemDashboard() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [templateType, setTemplateType] = useState('standard')

  // Initialize or retrieve session ID on component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('rfpSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      // Generate a new session ID (UUID)
      const newSessionId = crypto.randomUUID()
      localStorage.setItem('rfpSessionId', newSessionId)
      setSessionId(newSessionId)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  const handleUpload = async (selectedFiles: FileList) => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true)
    setError(null)
    
    // Convert FileList to array and filter for accepted types
    const newFiles = Array.from(selectedFiles).filter(file => {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      return fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc' || 
             fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'zip'
    })
    
    // Check file sizes
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the 50MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      setIsUploading(false);
      return;
    }
    
    // Add files to upload queue
    const newUploadQueue = newFiles.map(file => ({
      file,
      status: 'uploading' as const
    }))
    
    setUploadedFiles(prev => [...prev, ...newUploadQueue])
    
    // Create a single FormData with all files
    const formData = new FormData()
    
    // Add the session ID to the form data
    if (sessionId) {
      formData.append('session_id', sessionId)
    }
    
    // Add all files to the form data
    for (const file of newFiles) {
      formData.append('files', file)
    }
    
    // Add template type to form data
    formData.append('template_type', templateType)
    
    try {
      console.log('Starting upload with Fetch API for files:', newFiles.map(f => f.name));
      
      const response = await fetch('https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/analyze-documents/', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Fetch response received:', {
        status: response.status,
        ok: response.ok
      });
      
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error('Upload error:', errorText);
        
        // Update all files statuses to error
        setUploadedFiles(prev => 
          prev.map(item => 
            newFiles.includes(item.file)
              ? { ...item, status: 'error', message: `Upload failed: ${response.status}` } 
              : item
          )
        );
        setIsUploading(false);
        return;
      }
      
      // Use response.json() with error handling
      let data;
      try {
        const responseText = await response.text();
        console.log('Response text (first 100 chars):', responseText.substring(0, 100) + '...');
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        setUploadedFiles(prev => 
          prev.map(item => 
            newFiles.includes(item.file)
              ? { ...item, status: 'error', message: 'Invalid server response' } 
              : item
          )
        );
        setIsUploading(false);
        return;
      }
      
      console.log('Parsed response data:', data);
      
      if (data.success) {
        // Check if processed_files exists in the response
        if (data.processed_files && Array.isArray(data.processed_files)) {
          // Update file statuses based on processed_files from response
          const processedFilesMap = new Map(
            data.processed_files.map((pf: any) => [pf.filename, pf])
          );
          
          setUploadedFiles(prev => 
            prev.map(item => {
              const processedFile = processedFilesMap.get(item.file.name);
              if (processedFile) {
                return { 
                  ...item, 
                  status: processedFile.status === 'success' ? 'success' : 'error',
                  message: processedFile.status !== 'success' ? processedFile.error : undefined
                };
              }
              return item;
            })
          );
        } else {
          // If processed_files is missing, mark all files as successful
          // This handles the case where the backend doesn't return file-specific status
          setUploadedFiles(prev => 
            prev.map(item => 
              newFiles.includes(item.file)
                ? { ...item, status: 'success' }
                : item
            )
          );
        }
        
        // Store the session ID if it's returned from the server
        if (data.session_id && data.session_id !== sessionId) {
          localStorage.setItem('rfpSessionId', data.session_id);
          setSessionId(data.sessionId);
        }
        
        setIsFileUploaded(true);
        setIsUploading(false);
      } else {
        // Update all files statuses to error
        setUploadedFiles(prev => 
          prev.map(item => 
            newFiles.includes(item.file)
              ? { ...item, status: 'error', message: data.error || 'Upload failed' } 
              : item
          )
        );
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Failed to connect to the server: ${error.message}`);
      
      // Update file statuses to error
      setUploadedFiles(prev => 
        prev.map(item => 
          newFiles.includes(item.file)
            ? { ...item, status: 'error', message: `Connection error: ${error.message}` } 
            : item
        )
      );
      setIsUploading(false);
    }
  }

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(item => item.file !== fileToRemove))
    
    // If no successful uploads remain, reset the upload state
    const hasSuccessfulUploads = uploadedFiles.some(item => 
      item.file !== fileToRemove && item.status === 'success'
    )
    
    if (!hasSuccessfulUploads) {
      setIsFileUploaded(false)
    }
  }

  const handleAnalysis = async () => {
    if (!isFileUploaded || !sessionId) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/analyze-rfp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          template_type: templateType
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Store the complete analysis data in sessionStorage
        sessionStorage.setItem('rfpAnalysisData', JSON.stringify(data.result));
        
        // Navigate to analysis page
        router.push(`/analysis?session_id=${sessionId}`);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 relative"> 
        {/* Return Button */}
        <button 
          className="absolute top-6 left-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 z-20 transition-colors" 
          onClick={() => router.push('/')}
          aria-label="Return to Home" 
        >
          <ArrowLeftIcon className="h-5 w-5" /> 
        </button>
        
        {/* Header with Logo */}
        <div className='text-center mb-12 flex flex-col items-center'>
          <img src="/TL.png" alt="Twisted Loop Logo" className="h-24 mb-6" />
          <h1 className='text-3xl font-bold text-white mb-4'>Information Memorandum Analyzer</h1>
          <p className='text-lg text-gray-300 max-w-3xl mx-auto'>
            Upload your Information Memorandum documents to get an AI-powered analysis of key information, 
            financial data, and strategic insights to help you make informed investment decisions.
          </p>
        </div>

        {/* Process Flow with Modern Cards - slightly lighter backgrounds */}
        <div className='flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-12'>
          {/* Step 1 */}
          <div className='flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 w-64 border border-gray-700'>
            <div className='bg-orange-500/20 p-4 rounded-full mb-4'>
              <DocumentArrowUpIcon className='h-8 w-8 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>Upload</h3>
            <p className='text-sm text-gray-300 text-center'>Upload your Information Memorandum documents (PDF, Word, Excel)</p>
          </div>
          <ArrowRightIcon className='hidden md:block h-6 w-6 text-orange-500' />
          {/* Step 2 */}
          <div className='flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 w-64 border border-gray-700'>
            <div className='bg-orange-500/20 p-4 rounded-full mb-4'>
              <TableCellsIcon className='h-8 w-8 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>Analyze</h3>
            <p className='text-sm text-gray-300 text-center'>AI extracts key financial data and business information</p>
          </div>
          <ArrowRightIcon className='hidden md:block h-6 w-6 text-orange-500' />
          {/* Step 3 */}
          <div className='flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 w-64 border border-gray-700'>
            <div className='bg-orange-500/20 p-4 rounded-full mb-4'>
              <ChatBubbleBottomCenterTextIcon className='h-8 w-8 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>AI Chat</h3>
            <p className='text-sm text-gray-300 text-center'>Ask questions about the business and get instant insights</p>
          </div>
          <ArrowRightIcon className='hidden md:block h-6 w-6 text-orange-500' />
          {/* Step 4 */}
          <div className='flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 w-64 border border-gray-700'>
            <div className='bg-orange-500/20 p-4 rounded-full mb-4'>
              <ArrowDownTrayIcon className='h-8 w-8 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>Export</h3>
            <p className='text-sm text-gray-300 text-center'>Download analysis results to Excel for further review</p>
          </div>
        </div>

        {/* Instructions Panel with Modern Design - lighter background */}
        <div className='max-w-3xl mx-auto mb-12'>
          <div className='bg-gray-800 p-8 rounded-xl shadow-md border border-gray-700'>
            <div className='flex items-start mb-6'>
              <div className='bg-orange-500/20 p-3 rounded-full mr-4'>
                <InformationCircleIcon className='h-6 w-6 text-orange-500' />
              </div>
              <h2 className='text-xl font-semibold text-white'>How to Use the Information Memorandum Analyzer</h2>
            </div>

            <ol className='list-decimal pl-8 space-y-4 text-gray-200'>
              <li className='font-medium'>
                Click <span className='text-orange-400 font-semibold'>"Upload Documents"</span> to select and upload your Information Memorandum
                documents (PDF, Word, Excel, ZIP)
              </li>
              <li className='font-medium'>Wait for the checkmark to appear, confirming your files have been uploaded</li>
              <li className='font-medium'>
                Click <span className='text-orange-400 font-semibold'>"Start Analysis"</span> to begin processing your
                documents
              </li>
              <li className='font-medium'>Review the structured data and use the AI Chatbot to ask questions about the business</li>
              <li className='font-medium text-orange-300 font-bold'>
                Important: Please click "End Session" before closing the page to ensure all resources are properly released
              </li>
            </ol>

            <div className='mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600'>
              <p className='text-sm text-gray-200 flex items-start'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong>Note:</strong> The analysis process may take a few moments depending on the size and complexity
                  of your Information Memorandum documents.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Template Selector - lighter background */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="bg-gray-800 shadow-md rounded-xl p-6 border border-gray-700">
            <div className="flex items-start mb-4">
              <div className="bg-orange-500/20 p-2 rounded-full mr-4">
                <TableCellsIcon className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Analysis Template</h2>
            </div>
            
            <div className="relative">
              <select
                id="template-type"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="appearance-none block w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-4 pr-10 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out shadow-sm"
              >
                <option value="standard">Standard Information Memorandum</option>
                <option value="private_equity">Private Equity</option>
                <option value="venture_capital">Venture Capital</option>
                <option value="real_estate">Real Estate</option>
                <option value="mergers_acquisitions">Mergers & Acquisitions</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <ChevronDownIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />
              </div>
            </div>
            
            <p className="mt-3 text-sm text-gray-300 flex items-center">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
              Select the template type that matches your Information Memorandum for accurate analysis
            </p>
          </div>
        </div>
        
        {/* Upload Section with Modern Design - lighter background */}
        <div className='max-w-3xl mx-auto'>
          <div 
            className={`border-2 border-dashed rounded-xl p-10 mb-6 text-center transition-colors ${
              isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-orange-500/50 bg-gray-800'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <DocumentArrowUpIcon className='h-14 w-14 mx-auto text-orange-500/70' />
            <p className='mt-4 text-gray-200'>
              Drag and drop your Information Memorandum documents here, or
            </p>
            <label className='inline-block mt-4'>
              <input
                type='file'
                className='hidden'
                accept={ACCEPTED_FILE_TYPES}
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(e.target.files);
                  }
                }}
              />
              <span className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 cursor-pointer transition-colors duration-200'>
                Select Files
              </span>
            </label>
            <p className='mt-3 text-xs text-gray-400'>
              Supported formats: PDF (.pdf), Word (.docx, .doc), Excel (.xlsx, .xls), ZIP (.zip)
            </p>
          </div>

          {/* Uploaded Files List with Modern Design - lighter background */}
          {uploadedFiles.length > 0 && (
            <div className='bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-700'>
              <h3 className='text-lg font-medium text-white mb-4'>Uploaded Documents</h3>
              <ul className='divide-y divide-gray-700'>
                {uploadedFiles.map((fileObj, index) => (
                  <li key={index} className='py-4 flex justify-between items-center'>
                    <div className='flex items-center'>
                      <DocumentArrowUpIcon className='h-5 w-5 text-orange-500 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-white truncate max-w-xs'>{fileObj.file.name}</p>
                        <p className='text-xs text-gray-400'>{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      {fileObj.status === 'uploading' && (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2'></div>
                      )}
                      {fileObj.status === 'success' && (
                        <span className='text-green-500 mr-2'>✓</span>
                      )}
                      {fileObj.status === 'error' && (
                        <span className='text-red-400 text-xs mr-2'>{fileObj.message || 'Error'}</span>
                      )}
                      <button 
                        onClick={() => handleRemoveFile(fileObj.file)}
                        className='text-gray-400 hover:text-gray-200 transition-colors'
                      >
                        <XMarkIcon className='h-5 w-5' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Start Analysis Button */}
          <div className='flex justify-center'>
            <button
              className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all duration-200 ease-in-out w-48
                ${
                  !isFileUploaded
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20'
                }`}
              onClick={handleAnalysis}
              disabled={!isFileUploaded || isAnalyzing}
            >
              {isAnalyzing ? (
                <span className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  Analyzing...
                </span>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>

          {error && (
            <div className='mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-center text-red-300'>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error: {error}
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className='fixed inset-0 bg-gray-900 bg-opacity-90 z-50'>
            <LoadingState />
          </div>
        )}
      </div>
    </div>
  )
}