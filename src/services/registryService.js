/**
 * Registry Service - Supabase Integration
 * Handles API calls for user registration with Supabase backend
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Get UTM parameters from URL for marketing attribution
 */
const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_campaign: params.get('utm_campaign'),
    utm_medium: params.get('utm_medium')
  };
};

/**
 * Submit registry form data to Supabase
 * @param {Object} formData - The form data to submit
 * @param {string} formData.email - User's email
 * @param {string} formData.zipCode - User's ZIP code
 * @param {string} formData.inDPC - DPC practice status
 * @param {string} formData.contactPreference - Contact preference
 * @param {string} formData.referralSource - How they heard about Henrietta
 * @returns {Promise<Object>} API response
 */
export const submitRegistry = async (formData) => {
  try {
    const utm = getUTMParams();
    
    const payload = {
      email: formData.email,
      zip_code: formData.zipCode,
      dpc_status: formData.inDPC,
      contact_preference: formData.contactPreference,
      referral_source: formData.referralSource,
      timestamp: new Date().toISOString(),
      
      // Browser/device context
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      
      // Marketing attribution
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
      utm_medium: utm.utm_medium,
      
      // Additional metadata
      metadata: {
        page_url: window.location.href,
        referrer: document.referrer,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/landing_page_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'  // Don't return the inserted row (faster)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: 'Registration successful'
    };
    
  } catch (error) {
    console.error('Registry submission error:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if an email is already registered
 * Note: This is disabled for MVP due to RLS security
 * The client cannot read from the table for privacy
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} Whether email exists
 */
export const checkEmailExists = async (email) => {
  // For MVP: Skip this check
  // Reason: Row Level Security prevents client from reading the table
  // Alternative: Implement as Supabase Edge Function if needed
  console.warn('Email check not implemented in MVP - proceeding with submission');
  return false;
};

/**
 * Get DPC practices in a specific ZIP code
 * Note: This will be implemented when DPC directory data is available
 * @param {string} zipCode - ZIP code to search
 * @returns {Promise<Array>} List of practices
 */
export const getDPCPracticesByZip = async (zipCode) => {
  // TODO: Implement when DPC directory data is integrated
  console.warn('DPC practice lookup not implemented yet');
  return [];
};
