// Real API implementation that connects to the Python backend

export interface Contact {
    email: string;
    firstName: string;
    lastName: string;
    position: string;
  }
  
  export interface CompanyData {
    name: string;
    summary: string;
    email: string;
    domain: string;
    contacts: Contact[];
    linkedIn?: string;
    metrics?: Array<{
      label: string;
      value: number;
      maxValue: number;
      color: string;
    }>;
  }
  
  // Base URL for the API - use localhost for local development
  const API_BASE_URL = "http://localhost:8004";
  
  export const fetchCompanyData = async (companyNumber: string): Promise<CompanyData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/${companyNumber}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Add mock metrics since they're not provided by the backend
      // In a real app, these would come from the backend
      const companyData: CompanyData = {
        ...data,
        metrics: [
          { label: 'Total Assets', value: 614845, maxValue: 1000000, color: '#f97316' },
          { label: 'Current Assets', value: 309478, maxValue: 500000, color: '#f97316' },
          { label: 'Net Assets', value: 103298, maxValue: 200000, color: '#f97316' },
          { label: 'Cash', value: 51183, maxValue: 100000, color: '#f97316' }
        ]
      };
      
      return companyData;
    } catch (error) {
      console.error("Error fetching company data:", error);
      throw error;
    }
  }; 