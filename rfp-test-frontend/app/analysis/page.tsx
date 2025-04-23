'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingState from '@/components/LoadingState'
import ChatPopup from '@/components/ChatPopup'
import { 
  QuestionMarkCircleIcon, 
  LightBulbIcon, 
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CalendarIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  FlagIcon,
  CurrencyPoundIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  XMarkIcon,
  RocketLaunchIcon,
  CubeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

// Define proper types for the Information Memorandum data
interface FieldWithMetadata {
  value: string;
  confidence: number;
  is_interpreted: boolean;
  source_page: string;
}

interface ArrayFieldWithMetadata {
  value: string[];
  confidence: number;
  is_interpreted: boolean;
  source_page: string;
}

interface ObjectFieldWithMetadata {
  value: Record<string, any>;
  confidence: number;
  is_interpreted: boolean;
  source_page: string;
}

interface CompanyOverview {
  name?: FieldWithMetadata;
  tagline?: FieldWithMetadata;
  location?: ArrayFieldWithMetadata;
  industry?: FieldWithMetadata;
  subsidiaries?: ArrayFieldWithMetadata;
  founding_year?: FieldWithMetadata;
}

interface ValueProposition {
  main_value?: FieldWithMetadata;
  for_b2b_marketers?: FieldWithMetadata;
  for_talent_sourcing?: FieldWithMetadata;
}

interface ProductPortfolio {
  saas_products?: ArrayFieldWithMetadata;
  daas_products?: ArrayFieldWithMetadata;
  ai_products?: ArrayFieldWithMetadata;
}

interface FinancialHighlights {
  arr?: FieldWithMetadata;
  revenue?: FieldWithMetadata;
  bookings?: FieldWithMetadata;
  gross_margin?: FieldWithMetadata;
  renewal_rate?: FieldWithMetadata;
  customer_metrics?: ObjectFieldWithMetadata;
  future_projections?: ObjectFieldWithMetadata;
  Data_Consultancy?: any; // For backward compatibility
  Data_Solutions?: any; // For backward compatibility
  Sharktower?: any; // For backward compatibility
}

interface GrowthOpportunities {
  organic_growth?: ArrayFieldWithMetadata;
  inorganic_growth?: ArrayFieldWithMetadata;
  international_expansion?: ArrayFieldWithMetadata;
  product_expansion?: ArrayFieldWithMetadata;
  investment_needs?: ArrayFieldWithMetadata;
  consulting_growth?: ArrayFieldWithMetadata; // For backward compatibility
}

interface MarketAnalysis {
  total_market_size?: FieldWithMetadata;
  growth_rate?: FieldWithMetadata;
  target_segments?: ArrayFieldWithMetadata;
  geographical_breakdown?: ObjectFieldWithMetadata;
  competitive_landscape?: ArrayFieldWithMetadata;
}

interface Strategy {
  exit_strategy?: FieldWithMetadata;
  timeline?: FieldWithMetadata;
  product_strategy?: FieldWithMetadata;
  market_expansion?: FieldWithMetadata;
  ai_roadmap?: ObjectFieldWithMetadata;
  consulting_strategy?: FieldWithMetadata; // For backward compatibility
  growth?: FieldWithMetadata; // For backward compatibility
  international_expansion?: FieldWithMetadata; // For backward compatibility
}

interface LeadershipTeamMember {
  name?: FieldWithMetadata;
  role?: FieldWithMetadata;
  expertise?: FieldWithMetadata;
  background?: FieldWithMetadata;
}

interface FundingObjective {
  amount_sought?: FieldWithMetadata;
  use_of_funds?: ArrayFieldWithMetadata;
}

interface ContactPerson {
  name?: FieldWithMetadata;
  role?: FieldWithMetadata;
  email?: FieldWithMetadata;
  phone?: FieldWithMetadata;
}

interface ContactDetails {
  company_address?: FieldWithMetadata;
  key_contacts?: ContactPerson[];
  Bamburgh_Capital?: any; // For backward compatibility
}

interface InfoMemData {
  company_overview?: CompanyOverview;
  business_model?: FieldWithMetadata;
  value_proposition?: ValueProposition;
  product_portfolio?: ProductPortfolio;
  financial_advisor?: FieldWithMetadata;
  financial_highlights?: FinancialHighlights;
  growth_opportunities?: GrowthOpportunities;
  market_analysis?: MarketAnalysis;
  strategy?: Strategy;
  key_clients?: ArrayFieldWithMetadata;
  leadership_team?: LeadershipTeamMember[];
  funding_objective?: FundingObjective;
  contact_details?: ContactDetails;
  financial_information?: any; // For backward compatibility
}

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [rfpData, setRfpData] = useState<InfoMemData>({})
  const [error, setError] = useState<any>(null)
  const [similarityScore] = useState<number>(86)
  const [showInterpreted, setShowInterpreted] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.0)
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatPopupRef = useRef(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdFromParams = searchParams?.get('session_id')
  
  useEffect(() => {
    if (!sessionIdFromParams) {
      console.error('No session ID provided in URL')
      setError('No session ID provided. Please start from the upload page.')
      setIsLoading(false)
      return
    }
    
    // Load analysis data from sessionStorage or fetch from API
    const loadAnalysisData = () => {
      // Check if we have data in sessionStorage
      const storedData = sessionStorage.getItem('rfpAnalysisData');
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('Loaded analysis data:', parsedData);
          setRfpData(parsedData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing stored analysis data:', error);
          setError('Failed to load analysis data. Please try again.');
          setIsLoading(false);
        }
      } else {
        // If no data in sessionStorage, fetch from API
        fetchAnalysisData(sessionIdFromParams);
      }
    };

    const fetchAnalysisData = async (sessionId: string) => {
      try {
        // First try the endpoint for information memorandum analysis
        const response = await fetch(`https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/analyze-rfp/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analysis data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched analysis data:', data.result);
          setRfpData(data.result);
          // Store in sessionStorage for future use
          sessionStorage.setItem('rfpAnalysisData', JSON.stringify(data.result));
        } else {
          throw new Error(data.error || 'Failed to analyze data');
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setError(`Failed to load analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalysisData();
  }, [sessionIdFromParams])
  
  // Set up cleanup timer for session
  useEffect(() => {
    const cleanupTimeout = setTimeout(
      () => {
        const cleanupSession = async () => {
          if (sessionIdFromParams) {
            try {
              console.log('Cleaning up session after 30 minutes:', sessionIdFromParams)
              await fetch("https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/cleanup-session/", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  session_id: sessionIdFromParams
                })
              })
            } catch (error) {
              console.error('Error cleaning up session:', error)
            }
          }
        }

        cleanupSession()
      },
      30 * 60 * 1000
    ) // 30 minutes in milliseconds

    // Clean up the timeout when component unmounts
    return () => clearTimeout(cleanupTimeout)
  }, [sessionIdFromParams])

  const handleEndSession = async () => {
    if (sessionIdFromParams) {
      try {
        setIsLoading(true);
        await fetch("https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/cleanup-session/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionIdFromParams
          })
        });
        
        // Clear sessionStorage
        sessionStorage.removeItem('rfpAnalysisData');
        
        // Redirect to home page
        router.push('/');
      } catch (error) {
        console.error('Error cleaning up session:', error);
        setError('Failed to end session');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper function to render data with confidence indicators
  const renderDataItem = (
    field: any, 
    fieldName: string, 
    showInterpreted: boolean, 
    confidenceThreshold: number
  ) => {
    if (!field) return <p className="text-gray-400 italic">No data available</p>
    
    const { value, confidence, is_interpreted, source_page } = field
    
    // Skip interpreted data if showInterpreted is false
    if (!showInterpreted && is_interpreted) {
      return <p className="text-gray-400 italic">No direct data available</p>
    }
    
    // Skip low confidence data if below threshold
    if (confidence < confidenceThreshold) {
      return <p className="text-gray-400 italic">Low confidence data available</p>
    }
    
    // Handle different types of values
    let displayValue = ''
    if (Array.isArray(value)) {
      displayValue = value.join(', ')
    } else if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value, null, 2)
    } else {
      displayValue = String(value)
    }
    
    return (
      <div>
        <p className={`text-gray-300 ${is_interpreted ? 'italic' : ''}`}>
          {displayValue || 'No data available'}
        </p>
        {(is_interpreted || source_page) && (
          <div className="mt-1 flex items-center text-xs">
            {is_interpreted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-500 mr-2">
                Interpreted
              </span>
            )}
            {source_page && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                Page {source_page}
              </span>
            )}
          </div>
        )}
        {confidence > 0 && (
          <div className="mt-1">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  confidence > 0.7 ? 'bg-green-500' : 
                  confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Function to handle asking a question to the AI
  const askAiQuestion = async (question: string) => {
    setActiveQuestion(question)
    setIsAiLoading(true)
    setAiResponse(null)
    
    try {
      // Log the request data for debugging
      const requestData = {
        session_id: sessionIdFromParams,  // Include the session ID from the URL
        message: question,
      }
      console.log('Sending request data:', requestData)
      
      // Update the URL to point to your backend server
      const response = await fetch('https://tapestry-dashboard-api.mmopro.in/api/v1/rfp/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      // Log the response status and headers for debugging
      console.log('Response status:', response.status)
      
      // If the response is not OK, try to get the error message from the response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Error response data:', errorData)
        throw new Error(`Failed to get AI response: ${errorData?.error || response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      setAiResponse(data.response || 'No response from AI')
    } catch (error: unknown) {
      console.error('Error asking AI:', error)
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to get a response. Please try again.'}`)
    } finally {
      setIsAiLoading(false)
    }
  }

  // Add this function to format AI responses with markdown
  const formatAiResponse = (text: string) => {
    // Convert markdown to HTML (simple version)
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
  }


  // Render all dynamic sections based on the new schema
  const renderDynamicSections = () => {
    if (!rfpData) return null;
    
    return (
      <>  
        {/* Company Overview Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-orange-500" />
            </div>
            Business Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                  {renderDataItem(rfpData.company_overview?.name, 'name', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tagline</dt>
                  {renderDataItem(rfpData.company_overview?.tagline, 'tagline', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Industry</dt>
                  {renderDataItem(rfpData.company_overview?.industry, 'industry', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Founding Year</dt>
                  {renderDataItem(rfpData.company_overview?.founding_year, 'founding_year', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Location & Structure</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Locations</dt>
                  {renderDataItem(rfpData.company_overview?.location, 'location', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subsidiaries</dt>
                  {renderDataItem(rfpData.company_overview?.subsidiaries, 'subsidiaries', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Financial Advisor</dt>
                  {renderDataItem(rfpData.financial_advisor, 'financial_advisor', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Model & Value Proposition Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <BriefcaseIcon className="h-6 w-6 text-orange-500" />
            </div>
            Business Model & Value Proposition
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Business Model</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.business_model, 'business_model', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Value Proposition</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Main Value</dt>
                  {renderDataItem(rfpData.value_proposition?.main_value, 'main_value', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">For B2B Marketers</dt>
                  {renderDataItem(rfpData.value_proposition?.for_b2b_marketers, 'for_b2b_marketers', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">For Talent Sourcing</dt>
                  {renderDataItem(rfpData.value_proposition?.for_talent_sourcing, 'for_talent_sourcing', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Portfolio Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <DocumentTextIcon className="h-6 w-6 text-orange-500" />
            </div>
            Product Portfolio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">SaaS Products</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.product_portfolio?.saas_products, 'saas_products', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">DaaS Products</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.product_portfolio?.daas_products, 'daas_products', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">AI Products</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.product_portfolio?.ai_products, 'ai_products', showInterpreted, confidenceThreshold)}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Highlights Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <CurrencyPoundIcon className="h-6 w-6 text-orange-500" />
            </div>
            Financial Highlights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Revenue & Bookings</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ARR (Annual Recurring Revenue)</dt>
                  {renderDataItem(rfpData.financial_highlights?.arr, 'arr', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Revenue</dt>
                  {renderDataItem(rfpData.financial_highlights?.revenue, 'revenue', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bookings</dt>
                  {renderDataItem(rfpData.financial_highlights?.bookings, 'bookings', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Profitability & Margins</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gross Margin</dt>
                  {renderDataItem(rfpData.financial_highlights?.gross_margin, 'gross_margin', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Renewal Rate</dt>
                  {renderDataItem(rfpData.financial_highlights?.renewal_rate, 'renewal_rate', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Future Projections</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.financial_highlights?.future_projections, 'future_projections', showInterpreted, confidenceThreshold)}
              </div>
            </div>
          </div>
        </div>

        {/* Growth Opportunities Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-500" />
            </div>
            Growth Opportunities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Organic Growth</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Organic Growth Strategy</dt>
                  {renderDataItem(rfpData.growth_opportunities?.organic_growth, 'organic_growth', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Expansion</dt>
                  {renderDataItem(rfpData.growth_opportunities?.product_expansion, 'product_expansion', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Expansion Strategy</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">International Expansion</dt>
                  {renderDataItem(rfpData.growth_opportunities?.international_expansion, 'international_expansion', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Inorganic Growth</dt>
                  {renderDataItem(rfpData.growth_opportunities?.inorganic_growth, 'inorganic_growth', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Investment Needs</dt>
                  {renderDataItem(rfpData.growth_opportunities?.investment_needs, 'investment_needs', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Analysis Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <GlobeAltIcon className="h-6 w-6 text-orange-500" />
            </div>
            Market Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Market Size & Growth</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Market Size</dt>
                  {renderDataItem(rfpData.market_analysis?.total_market_size, 'total_market_size', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Growth Rate</dt>
                  {renderDataItem(rfpData.market_analysis?.growth_rate, 'growth_rate', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Target Segments</dt>
                  {renderDataItem(rfpData.market_analysis?.target_segments, 'target_segments', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Competitive Landscape</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.market_analysis?.competitive_landscape, 'competitive_landscape', showInterpreted, confidenceThreshold)}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <FlagIcon className="h-6 w-6 text-orange-500" />
            </div>
            Strategy & Roadmap
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Product Strategy</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.strategy?.product_strategy, 'product_strategy', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Market Expansion</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.strategy?.market_expansion, 'market_expansion', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Exit Strategy</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  {renderDataItem(rfpData.strategy?.exit_strategy, 'exit_strategy', showInterpreted, confidenceThreshold)}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  {renderDataItem(rfpData.strategy?.timeline, 'timeline', showInterpreted, confidenceThreshold)}
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Roadmap (if available) */}
          {rfpData.strategy?.ai_roadmap && (
            <div className="mt-8 bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">AI Roadmap</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.strategy?.ai_roadmap, 'ai_roadmap', showInterpreted, confidenceThreshold)}
              </div>
            </div>
          )}
        </div>

        {/* Key Clients Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-orange-500" />
            </div>
            Key Clients
          </h2>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
            <div className="space-y-3">
              {renderDataItem(rfpData.key_clients, 'key_clients', showInterpreted, confidenceThreshold)}
            </div>
          </div>
        </div>

        {/* Leadership Team Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <UserGroupIcon className="h-6 w-6 text-orange-500" />
            </div>
            Leadership Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rfpData.leadership_team && rfpData.leadership_team.map((leader, index) => (
              <div key={index} className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
                <h3 className="text-lg font-medium text-orange-400 mb-3 border-b border-gray-700 pb-2">
                  {leader.name?.value || "Team Member"}
                </h3>
                <div className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    {renderDataItem(leader.role, 'role', showInterpreted, confidenceThreshold)}
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expertise</dt>
                    {renderDataItem(leader.expertise, 'expertise', showInterpreted, confidenceThreshold)}
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Background</dt>
                    {renderDataItem(leader.background, 'background', showInterpreted, confidenceThreshold)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Objective Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-orange-500" />
            </div>
            Funding Objective
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Amount Sought</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.funding_objective?.amount_sought, 'amount_sought', showInterpreted, confidenceThreshold)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-lg font-medium text-orange-400 mb-4 border-b border-gray-700 pb-2">Use of Funds</h3>
              <div className="space-y-3">
                {renderDataItem(rfpData.funding_objective?.use_of_funds, 'use_of_funds', showInterpreted, confidenceThreshold)}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-xl font-semibold text-red-600'>Error: {error}</div>
      </div>
    )
  }

  if (!rfpData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-xl font-semibold text-gray-600'>No analysis data found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/TL.png" alt="Twisted Loop Logo" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-white">Information Memorandum Analysis</h1>
                <p className="text-sm text-gray-400">Analyzing business opportunities with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Add navigation buttons */}
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => router.push(`/csuite-analysis`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center"
              >
                C-Suite Analysis
                <ArrowLeftIcon className="h-4 w-4 ml-2 transform rotate-180" />
              </button>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with improved spacing and layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add similarity score display */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-full mr-3 shadow-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-500" />
            </div>
            Document Similarity
          </h2>
          <div className="flex items-center">
            <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5 mr-4">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${similarityScore}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-green-500">{similarityScore}%</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Similarity score between your document and our reference database
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-orange-500 mr-2" />
            Display Options
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center">
              <input
                id="show-interpreted"
                type="checkbox"
                checked={showInterpreted}
                onChange={e => setShowInterpreted(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-700 rounded bg-gray-700"
              />
              <label htmlFor="show-interpreted" className="ml-2 block text-sm text-gray-300">
                Show interpreted data
              </label>
            </div>

            <div className="w-64">
              <label htmlFor="confidence" className="block text-sm font-medium text-gray-300 mb-1">
                Minimum confidence:
              </label>
              <div className="relative">
                <select
                  id="confidence"
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md appearance-none bg-gray-700 text-white"
                >
                  <option value={0}>Show all</option>
                  <option value={0.3}>Low confidence (30%+)</option>
                  <option value={0.5}>Medium confidence (50%+)</option>
                  <option value={0.7}>High confidence (70%+)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
            
        {/* Data Confidence Legend */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <InformationCircleIcon className="h-6 w-6 text-orange-500 mr-2" />
            Data Confidence Legend
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-600 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-300">High confidence (80-100%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-yellow-600 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-300">Medium confidence (50-80%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-600 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-300">Low confidence (1-50%)</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-500 mr-3">
                Interpreted
              </span>
              <span className="text-sm font-medium text-gray-300">
                AI interpretation (not directly stated in IM)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {renderDynamicSections()}

        {/* Ask AI Section */}
        <div className='bg-gray-800/50 rounded-lg border border-gray-700 shadow-inner mb-6'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex items-center mb-4'>
              <SparklesIcon className='h-6 w-6 text-orange-500 mr-2' />
              <h3 className='text-lg font-medium text-white'>Ask AI about this Information Memorandum</h3>
            </div>
            
            <p className='text-sm text-gray-300 mb-4'>
              Get instant insights about this Information Memorandum by clicking on any of these questions:
            </p>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'>
              <button
                onClick={() => askAiQuestion("What are the key financial highlights in this Information Memorandum?")}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  activeQuestion === "What are the key financial highlights in this Information Memorandum?" 
                    ? 'bg-orange-900/50 border-orange-500 text-orange-300' 
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                }`}
              >
                <div className='flex items-center'>
                  <QuestionMarkCircleIcon className='h-5 w-5 text-orange-500 mr-2 flex-shrink-0' />
                  <span>What are the key financial highlights?</span>
                </div>
              </button>
              
              <button
                onClick={() => askAiQuestion("What are the growth opportunities mentioned in this Information Memorandum?")}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  activeQuestion === "What are the growth opportunities mentioned in this Information Memorandum?" 
                    ? 'bg-orange-900/50 border-orange-500 text-orange-300' 
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                }`}
              >
                <div className='flex items-center'>
                  <QuestionMarkCircleIcon className='h-5 w-5 text-orange-500 mr-2 flex-shrink-0' />
                  <span>What are the growth opportunities?</span>
                </div>
              </button>
              
              <button
                onClick={() => askAiQuestion("Summarize the company's strategy and market position.")}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  activeQuestion === "Summarize the company's strategy and market position." 
                    ? 'bg-orange-900/50 border-orange-500 text-orange-300' 
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                }`}
              >
                <div className='flex items-center'>
                  <QuestionMarkCircleIcon className='h-5 w-5 text-orange-500 mr-2 flex-shrink-0' />
                  <span>Summarize the company's strategy and market position</span>
                </div>
              </button>
              
              <button
                onClick={() => askAiQuestion("What are the key strengths of the leadership team?")}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  activeQuestion === "What are the key strengths of the leadership team?" 
                    ? 'bg-orange-900/50 border-orange-500 text-orange-300' 
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                }`}
              >
                <div className='flex items-center'>
                  <QuestionMarkCircleIcon className='h-5 w-5 text-orange-500 mr-2 flex-shrink-0' />
                  <span>What are the key strengths of the leadership team?</span>
                </div>
              </button>
            </div>
            
            {/* AI Response Area */}
            {(isAiLoading || aiResponse) && (
              <div className='mt-4 border border-gray-700 rounded-lg overflow-hidden'>
                <div className='bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 border-b border-gray-700'>
                  <div className='flex items-center'>
                    <LightBulbIcon className='h-5 w-5 text-orange-500 mr-2' />
                    <h4 className='font-medium text-white'>AI Response</h4>
                  </div>
                </div>
                
                <div className='p-4 bg-gray-800/30'>
                  {isAiLoading ? (
                    <div className='flex items-center justify-center py-6'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500'></div>
                      <span className='ml-2 text-gray-300'>Analyzing...</span>
                    </div>
                  ) : (
                    <div className='prose prose-invert prose-orange max-w-none'>
                      {aiResponse && (
                        <div dangerouslySetInnerHTML={{ __html: formatAiResponse(String(aiResponse)) }} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className='mt-4 text-center'>
              <button
                onClick={() => setIsChatOpen(true)}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500'
              >
                <ChatBubbleBottomCenterTextIcon className='h-5 w-5 mr-2' />
                Open Full Chat Interface
              </button>
            </div>
          </div>
        </div>
      
        {/* Footer */}
        <div className="bg-gray-900 border-t border-gray-800 py-4 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Powered by Twisted Loop AI
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Built with</span>
                <span className="text-orange-500">♥</span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Chat popup */}
        <ChatPopup isOpen={isChatOpen} setIsOpen={setIsChatOpen} ref={chatPopupRef} />
      </div>
    </div>
  )
}