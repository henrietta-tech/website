/**
 * Registry Service - Honest Minimum
 * 
 * What this does:
 * - Validates on client (for UX, not security)
 * - Submits to edge function
 * - Includes honeypot for basic bot defense
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ===== VALIDATION =====

export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (email.length > 254) return 'Email is too long';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
}

export function validateZip(zip) {
  if (!zip) return 'ZIP code is required';
  if (!/^\d{5}$/.test(zip)) return 'ZIP code must be 5 digits';
  return null;
}

export function validate(data) {
  const errors = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const zipError = validateZip(data.zipCode);
  if (zipError) errors.zipCode = zipError;
  
  return errors;
}

// ===== UTM PARAMS =====

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  };
}

// ===== SUBMISSION =====

export async function submitRegistry(formData) {
  // Client validation (for UX - server validates too)
  const errors = validate({ email: formData.email, zipCode: formData.zipCode });
  if (Object.keys(errors).length > 0) {
    return { success: false, error: Object.values(errors)[0] };
  }

  const utm = getUtmParams();

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email.trim(),
        zipCode: formData.zipCode.trim(),
        dpcStatus: formData.inDPC,
        contactPreference: formData.contactPreference,
        referralSource: formData.referralSource,
        website: formData.website,  // honeypot
        ...utm
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Registration failed' };
    }

    return { success: true };

  } catch (e) {
    console.error('Submit error:', e);
    return { success: false, error: 'Network error. Please try again.' };
  }
}