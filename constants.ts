import type { ReportData } from './types';
import { Type } from '@google/genai';
import { User } from '@supabase/supabase-js';

export const INITIAL_REPORT_DATA: ReportData = {
  patient_info: { 
    initials: null, age: null, dob: null, sex: null, weight: null, weight_unit: null, 
    race: [], ethnicity: null, allergies: null, medical_conditions: null, other_info: null 
  },
  adverse_event: { 
    problem_type: [], outcomes: [], event_onset_date: null, 
    description_narrative: null, relevant_tests: null, additional_comments: null 
  },
  suspect_product: { 
    name: null, product_type: [], ndc_number: null, manufacturer: null, lot_number: null, expiration_date: null,
    dose: null, quantity_taken: null, frequency: null, route: null, therapy_start_date: null, therapy_end_date: null,
    therapy_ongoing: null, reason_for_use: null, problem_resolved_after_stopping: null,
    problem_returned_after_restarting: null
  },
  concomitant_products: [],
  reporter_info: { 
    first_name: null, last_name: null, phone: null, email: null, address: null, city: null,
    state: null, zip_code: null, country: null, reported_to_manufacturer: null, permission_to_share_identity: null
  },
  product_available: null,
};

// Utility function to create initial report data with user information auto-filled
export const createInitialReportDataWithUser = (user: User | null): ReportData => {
  const baseData = { ...INITIAL_REPORT_DATA };
  
  if (user && user.user_metadata) {
    const metadata = user.user_metadata;
    
    // Auto-fill reporter information from user metadata
    baseData.reporter_info = {
      ...baseData.reporter_info,
      first_name: metadata.first_name || null,
      last_name: metadata.last_name || null,
      email: user.email || null,
      phone: metadata.phone || null,
      address: metadata.address || null,
      city: metadata.city || null,
      state: metadata.state || null,
      zip_code: metadata.zip_code || null,
      country: metadata.country || null,
      reported_to_manufacturer: metadata.reported_to_manufacturer_preference ?? null,
      permission_to_share_identity: metadata.permission_to_share_identity_preference ?? null,
    };
  }
  
  return baseData;
};

// Utility function to calculate profile completion percentage
export const calculateProfileCompletionPercentage = (user: User | null): number => {
  if (!user) return 0;
  
  const metadata = user.user_metadata || {};
  
  // Base fields that apply to everyone
  const baseFields = [
    metadata.first_name,
    metadata.last_name,
    user.email,
    metadata.phone,
    metadata.country,
    metadata.profession,
    metadata.preferred_contact_method,
    metadata.address,
    metadata.city,
    metadata.state,
    metadata.zip_code
  ];
  
  let totalFields = baseFields.length;
  let completedFields = baseFields.filter(field => field && field.trim() !== '').length;
  
  // Add professional fields only for relevant professions
  const profession = metadata.profession;
  const professionalRoles = [
    'physician', 'nurse', 'pharmacist', 'physician_assistant', 
    'nurse_practitioner', 'dentist', 'veterinarian', 'healthcare_professional',
    'researcher', 'lawyer', 'regulatory_affairs', 'pharmaceutical_industry'
  ];
  
  if (profession && professionalRoles.includes(profession)) {
    const professionalFields = [
      metadata.institution,
      metadata.specialization,
      metadata.license_number
    ];
    totalFields += professionalFields.length;
    completedFields += professionalFields.filter(field => field && field.trim() !== '').length;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Helper to get missing profile fields for suggestions
export const getMissingProfileFields = (user: User | null): string[] => {
  if (!user) return [];
  
  const metadata = user.user_metadata || {};
  const missingFields: string[] = [];
  
  // Base fields that apply to everyone
  if (!metadata.phone) missingFields.push('Phone number');
  if (!metadata.country) missingFields.push('Country');
  if (!metadata.preferred_contact_method) missingFields.push('Preferred contact method');
  if (!metadata.address) missingFields.push('Address');
  if (!metadata.city) missingFields.push('City');
  if (!metadata.state) missingFields.push('State/Province');
  if (!metadata.zip_code) missingFields.push('ZIP/Postal code');
  
  // Professional fields only for relevant professions
  const profession = metadata.profession;
  const professionalRoles = [
    'physician', 'nurse', 'pharmacist', 'physician_assistant', 
    'nurse_practitioner', 'dentist', 'veterinarian', 'healthcare_professional',
    'researcher', 'lawyer', 'regulatory_affairs', 'pharmaceutical_industry'
  ];
  
  if (profession && professionalRoles.includes(profession)) {
    if (!metadata.institution) missingFields.push('Institution/Practice');
    if (!metadata.specialization) missingFields.push('Specialization');
    if (!metadata.license_number) missingFields.push('License number');
  }
  
  return missingFields;
};

export const getAdverseEffectSuggestionsTool = {
  functionDeclarations: [
    {
      name: 'get_adverse_effect_suggestions',
      description: "Gets a list of medically accurate terms related to a user's description of a side effect or adverse event. Use this to help clarify the user's symptoms. You need to call this function as soon as user input the side effect. YOU SHOULD USE THIS FUCNTION COMPULSORY",
      parameters: {
        type: Type.OBJECT,
        properties: {
          symptom_description: {
            type: Type.STRING,
            description: 'The user\'s colloquial description of their symptom, for example "stomach ache" or "I feel dizzy and sick".',
          },
        },
        required: ['symptom_description'],
      },
    },
  ],
};

export const SYSTEM_PROMPT = `You are the AERS Reporting Agent, a friendly and empathetic AI medical assistant. Your goal is to help a user fill out a detailed adverse event report, modeled after the FDA's MedWatch 3500B form.

**CRITICAL: FIELD COMPLETION AWARENESS**
Before asking any question, you MUST carefully examine the current report data. Users can manually fill out form fields using the interface, and you should NEVER ask for information that is already populated in the current report data. This is a critical requirement.

**FIELD CHECKING RULES:**
- If a field contains a non-null, non-empty value (including arrays with elements), DO NOT ask about it
- If a field is null, undefined, empty string, or empty array, you may ask about it
- Always acknowledge when you see fields are already filled: "I see you've already provided [field information]"
- Focus only on gathering missing information to complete the report

**IMPORTANT: REPORTER INFORMATION IS AUTO-FILLED**
The reporter information (first name, last name, email, country) is automatically populated from the user's authenticated profile. You should NOT ask for or attempt to modify these fields. When returning updated_report_data, you MUST preserve any existing values in the reporter_info section - do not overwrite them with null or empty values.

**CORE WORKFLOW**
Your process for gathering information is strict and must be followed in this order:

1.  **STEP 1: IDENTIFY THE PRIMARY SYMPTOM (MANDATORY TOOL USE)**
    - When the user first describes their problem (e.g., "I have a rash", "my stomach feels funny", "I'm dizzy"), your one and only first action **MUST** be to call the get_adverse_effect_suggestions tool.
    - **IMPORTANT**: Only call this tool if the current report data shows adverse_event.description_narrative is null. If it already contains a value, DO NOT call the tool again.
    - Provide the user's entire description of the symptom to the symptom_description parameter.
    - **DO NOT** ask any clarifying questions (like "when did it start?" or "what is the product name?") before you have successfully used this tool. This is a critical, non-negotiable step.
    - The application will handle the output of this tool and present suggestions to the user.

2.  **STEP 2: PROCESS THE USER'S SELECTION**
    - The user's choice from the suggestions will come back to you as a new message in the conversation history.
    - You **MUST** take this exact term and place it in the adverse_event.description_narrative field in the report.

3.  **STEP 3: CONTINUE THE CONVERSATION WITH FIELD AWARENESS**
    - **Only after** the description_narrative has been populated with a term from the user's selection, you should then proceed to fill the rest of the report.
    - **BEFORE asking any question**, scan the current report data for already filled fields
    - **SKIP** any fields that are already populated and acknowledge them: "I see you've already provided your age as 45"
    - Ask clear, simple, friendly questions, one at a time, to gather ONLY the missing information
    - Focus on: patient information, adverse event details, suspect product information, and concomitant medications.
    - **DO NOT** ask about reporter information (name, email, phone, address) as this is automatically handled.
    - **PRESERVE** any existing reporter_info values in your response - copy them exactly from the current report data.
    - Analyze the entire conversation history, the current report data, and any provided images to inform your questions.

**CRITICAL: NEVER CALL THE TOOL TWICE**
- If a user message contains phrases like "I confirm that", "best describes my symptom", or appears to be selecting from previous suggestions, this is NOT a new symptom description - it is a confirmation of a previous selection.
- In such cases, you must place the selected term in adverse_event.description_narrative and continue with normal conversation. DO NOT call the get_adverse_effect_suggestions tool again.

**GENERAL RULES**
- Your final output on every turn (except when you call a tool) MUST be a single, valid JSON object with two keys: "ai_response_message" and "updated_report_data".
- **CRITICAL**: The updated_report_data must be a COMPLETE ReportData object with ALL fields present, even if they remain null. Never return a partial object structure.
- **PRESERVE**: When returning updated_report_data, you must preserve ALL existing values in reporter_info exactly as they appear in the current report data.
- **PRESERVE**: When returning updated_report_data, you must preserve ALL existing values from ANY section that already contain data - only update fields where you have new information.
- Only update fields that you have new information for - all other fields should remain exactly as they were in the current report data.
- Dates should be in YYYY-MM-DD format. The current date is provided for reference.
- Do not make up information.
- If all essential fields in the report are reasonably filled (excluding reporter info which is auto-handled), your \`ai_response_message\` should be a final confirmation that includes the exact phrase: "The report is now complete." Do not ask more questions after this.
`;

const patientInfoSchema = {
  type: Type.OBJECT,
  properties: {
    initials: { type: Type.STRING, nullable: true, description: "Patient's initials, e.g., 'J.D.'" },
    age: { type: Type.INTEGER, nullable: true, description: "Patient's age in years." },
    dob: { type: Type.STRING, nullable: true, description: "Patient's date of birth in YYYY-MM-DD format." },
    sex: { type: Type.STRING, enum: ['Male', 'Female', 'Unknown'], nullable: true, description: "Patient's sex at birth." },
    weight: { type: Type.INTEGER, nullable: true },
    weight_unit: { type: Type.STRING, enum: ['kg', 'lbs'], nullable: true },
    race: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Patient's race. Can include: American Indian or Alaska Native, Asian, Black or African American, Native Hawaiian or Other Pacific Islander, White." },
    ethnicity: { type: Type.STRING, enum: ['Hispanic or Latino', 'Not Hispanic or Latino', 'Unknown'], nullable: true },
    allergies: { type: Type.STRING, nullable: true, description: "Free text list of patient's known allergies." },
    medical_conditions: { type: Type.STRING, nullable: true, description: "Free text list of patient's known medical conditions (e.g., diabetes, high blood pressure)." },
    other_info: { type: Type.STRING, nullable: true, description: "Other important information like tobacco use, pregnancy, alcohol use." },
  },
};

const adverseEventSchema = {
    type: Type.OBJECT,
    properties: {
        problem_type: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The kind of problem. E.g., 'Side effect', 'Product quality problem', 'Incorrect use'." },
        outcomes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The outcome of the event. E.g., 'Hospitalization', 'Life-threatening', 'Disability', 'Birth defect', 'Death'." },
        event_onset_date: { type: Type.STRING, nullable: true, description: "Date the problem started, in YYYY-MM-DD format." },
        description_narrative: { type: Type.STRING, nullable: true, description: "A detailed description of what happened." },
        relevant_tests: { type: Type.STRING, nullable: true, description: "Any relevant tests or lab results." },
        additional_comments: { type: Type.STRING, nullable: true, description: "Any other comments from the user." },
    }
};

const suspectProductSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, nullable: true, description: "Name of the product/medication." },
        product_type: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Type of product. E.g., 'Prescription', 'Over-the-Counter', 'Compounded', 'Generic', 'Biosimilar'." },
        ndc_number: { type: Type.STRING, nullable: true, description: "The National Drug Code (NDC) number, if available." },
        manufacturer: { type: Type.STRING, nullable: true, description: "The name of the company that makes the product." },
        lot_number: { type: Type.STRING, nullable: true },
        expiration_date: { type: Type.STRING, nullable: true, description: "Expiration date in YYYY-MM-DD format." },
        dose: { type: Type.STRING, nullable: true, description: "Strength of the product, e.g., '20 mg'." },
        quantity_taken: { type: Type.STRING, nullable: true, description: "How much was taken, e.g., '2 pills'." },
        frequency: { type: Type.STRING, nullable: true, description: "How often it was taken, e.g., 'twice daily'." },
        route: { type: Type.STRING, nullable: true, description: "How the product was taken or used, e.g., 'by mouth', 'on the skin'." },
        therapy_start_date: { type: Type.STRING, nullable: true, description: "Date therapy started, in YYYY-MM-DD format." },
        therapy_end_date: { type: Type.STRING, nullable: true, description: "Date therapy stopped, in YYYY-MM-DD format." },
        therapy_ongoing: { type: Type.BOOLEAN, nullable: true },
        reason_for_use: { type: Type.STRING, nullable: true, description: "The condition the product was used to treat." },
        problem_resolved_after_stopping: { type: Type.BOOLEAN, nullable: true, description: "Did the problem stop after discontinuing the product?" },
        problem_returned_after_restarting: { type: Type.STRING, enum: ['Yes', 'No', "Didn't restart"], nullable: true, description: "Did the problem return if the product was used again?" },
    }
};

const concomitantProductsSchema = {
    type: Type.ARRAY,
    items: { 
      type: Type.OBJECT,
      properties: { name: { type: Type.STRING } },
      required: ['name']
    },
    description: "List of other medications, vitamins, or supplements the patient is taking."
};

const reporterInfoSchema = {
    type: Type.OBJECT,
    properties: {
        first_name: { type: Type.STRING, nullable: true, description: "Auto-filled from user profile - do not ask for this" },
        last_name: { type: Type.STRING, nullable: true, description: "Auto-filled from user profile - do not ask for this" },
        phone: { type: Type.STRING, nullable: true, description: "Optional field - only fill if user volunteers this information" },
        email: { type: Type.STRING, nullable: true, description: "Auto-filled from user profile - do not ask for this" },
        address: { type: Type.STRING, nullable: true, description: "Optional field - only fill if user volunteers this information" },
        city: { type: Type.STRING, nullable: true, description: "Optional field - only fill if user volunteers this information" },
        state: { type: Type.STRING, nullable: true, description: "Optional field - only fill if user volunteers this information" },
        zip_code: { type: Type.STRING, nullable: true, description: "Optional field - only fill if user volunteers this information" },
        country: { type: Type.STRING, nullable: true, description: "Auto-filled from user profile - do not ask for this" },
        reported_to_manufacturer: { type: Type.BOOLEAN, nullable: true, description: "Ask only if relevant to the conversation flow" },
        permission_to_share_identity: { type: Type.BOOLEAN, nullable: true, description: "Ask only if relevant to the conversation flow" },
    }
};

const reportDataSchema = {
  type: Type.OBJECT,
  properties: {
    patient_info: patientInfoSchema,
    adverse_event: adverseEventSchema,
    suspect_product: suspectProductSchema,
    concomitant_products: concomitantProductsSchema,
    reporter_info: reporterInfoSchema,
    product_available: { type: Type.BOOLEAN, nullable: true, description: "Does the user still have the product?" },
  },
  required: ['patient_info', 'adverse_event', 'suspect_product', 'concomitant_products', 'reporter_info', 'product_available']
};


export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ai_response_message: { type: Type.STRING, description: "The friendly, empathetic question to ask the user next, or a final confirmation message." },
    updated_report_data: reportDataSchema,
  },
  required: ['ai_response_message', 'updated_report_data'],
};