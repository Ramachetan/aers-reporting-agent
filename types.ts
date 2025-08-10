// Section E - About the Person Who Had the Problem
export interface PatientInfo {
  initials: string | null;
  age: number | null;
  dob: string | null; // YYYY-MM-DD
  sex: 'Male' | 'Female' | 'Unknown' | null;
  weight: number | null;
  weight_unit: 'kg' | 'lbs' | null;
  race: string[]; // Can select multiple from: American Indian or Alaska Native, Asian, Black or African American, Native Hawaiian or Other Pacific Islander, White
  ethnicity: 'Hispanic or Latino' | 'Not Hispanic or Latino' | 'Unknown' | null;
  allergies: string | null; // Free text
  medical_conditions: string |null; // Free text
  other_info: string | null; // Free text for tobacco product use, pregnancy, alcohol use, etc.
}

// Section A - About the Problem
export interface AdverseEvent {
  problem_type: string[]; // e.g., 'Side effect', 'Product quality problem', 'Incorrect use'
  outcomes: string[]; // e.g., 'Hospitalization', 'Life-threatening', 'Death'
  event_onset_date: string | null; // YYYY-MM-DD
  description_narrative: string | null;
  relevant_tests: string | null; // Free text
  additional_comments: string | null; // Free text
}

// Section C - About the Product
export interface SuspectProduct {
  name: string | null;
  product_type: string[]; // e.g., 'Prescription', 'Over-the-Counter', 'Compounded'
  ndc_number: string | null;
  manufacturer: string | null;
  lot_number: string | null;
  expiration_date: string | null; // YYYY-MM-DD
  dose: string | null; // e.g., "20 mg"
  quantity_taken: string | null; // e.g., "2 pills"
  frequency: string | null; // e.g., "twice daily"
  route: string | null; // e.g., "by mouth"
  therapy_start_date: string | null; // YYYY-MM-DD
  therapy_end_date: string | null; // YYYY-MM-DD
  therapy_ongoing: boolean | null;
  reason_for_use: string | null;
  problem_resolved_after_stopping: boolean | null;
  problem_returned_after_restarting: 'Yes' | 'No' | "Didn't restart" | null;
}

// Corresponds to Section E, items 11 & 12
export interface ConcomitantProduct {
  name: string;
}

// Section F - About the Person Filling Out This Form
export interface ReporterInfo {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  reported_to_manufacturer: boolean | null;
  permission_to_share_identity: boolean | null; // true if they check the box (do NOT share)
}

export interface ReportData {
  patient_info: PatientInfo;
  adverse_event: AdverseEvent;
  suspect_product: SuspectProduct;
  concomitant_products: ConcomitantProduct[];
  reporter_info: ReporterInfo;
  product_available: boolean | null; // From Section B
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
}

export interface GeminiResponse {
  ai_response_message: string;
  updated_report_data: ReportData;
  suggestions?: string[];
}