
import React, { useState } from 'react';
import type { ReportData } from '../types';
import { User } from '@supabase/supabase-js';
import { UserIcon, PillIcon, ClipboardTextIcon, ListPlusIcon, ReporterIcon, AlertTriangleIcon, PencilIcon } from './Icons';

interface ReportPanelProps {
  data: ReportData;
  isReviewMode?: boolean;
  onUpdateReport?: (updatedData: ReportData) => void;
  user?: User | null;
}

const formatKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const ValueDisplay: React.FC<{ value: any }> = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-text-muted italic">Not specified</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-text-muted italic">None</span>;
    }
    return (
      <div>
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-text">{typeof item === 'object' ? item.name : item}</li>
          ))}
        </ul>
        <span className="text-xs text-green-600 mt-1 block">✓ User provided</span>
      </div>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <div>
        <span className="font-medium text-text">{value ? 'Yes' : 'No'}</span>
        <span className="text-xs text-green-600 ml-2">✓ User provided</span>
      </div>
    );
  }
  return (
    <div>
      <span className="font-medium text-text break-words">{String(value)}</span>
      <span className="text-xs text-green-600 ml-2">✓ User provided</span>
    </div>
  );
};

const DataRenderer: React.FC<{ data: object | null | undefined }> = ({ data }) => {
  if (!data) return null;

  const entries = Object.entries(data).filter(([_, value]) => value !== undefined);

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-text-muted font-medium">{formatKey(key)}:</span>
          <ValueDisplay value={value} />
        </div>
      ))}
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onEdit?: () => void; isEditing?: boolean; isEditable?: boolean; }> = 
  ({ title, icon, children, onEdit, isEditing, isEditable = true }) => (
  <section className="space-y-4 rounded-lg bg-background/50 p-4 transition-shadow hover:shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-text text-lg">{title}</h3>
      </div>
      {isEditable && onEdit && !isEditing && (
        <button 
          onClick={onEdit}
          className="p-2 rounded-full hover:bg-gray-200 text-text-muted hover:text-primary transition-colors"
          aria-label={`Edit ${title}`}
        >
          <PencilIcon />
        </button>
      )}
    </div>
    <div className="pl-9">
        {children}
    </div>
  </section>
);

const calculateProgress = (data: ReportData): number => {
    const fields = [
        data.patient_info.initials, data.patient_info.age, data.patient_info.dob, data.patient_info.sex, data.patient_info.weight, data.patient_info.race, data.patient_info.ethnicity, data.patient_info.allergies, data.patient_info.medical_conditions,
        data.adverse_event.problem_type, data.adverse_event.outcomes, data.adverse_event.event_onset_date, data.adverse_event.description_narrative,
        data.suspect_product.name, data.suspect_product.manufacturer, data.suspect_product.dose, data.suspect_product.route, data.suspect_product.therapy_start_date, data.suspect_product.reason_for_use,
        data.concomitant_products,
        // Note: Reporter info (first_name, last_name, email) are auto-filled and not counted in progress
        data.product_available
    ];

    const totalFields = fields.length;
    const filledFields = fields.filter(v => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== null && v !== undefined && v !== '';
    }).length;
    
    if (totalFields === 0) return 0;
    return Math.round((filledFields / totalFields) * 100);
}

const inputClasses = "w-full p-2 text-sm bg-white rounded-md border border-border-medium focus:outline-none focus:ring-2 focus:ring-primary transition-shadow disabled:bg-gray-100";
const labelClasses = "text-text-muted font-medium";

const ReportPanel: React.FC<ReportPanelProps> = ({ data, isReviewMode = false, onUpdateReport, user }) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const progress = calculateProgress(data);

  const handleEditClick = (sectionKey: keyof ReportData, sectionData: any) => {
    const dataToEdit = { ...sectionData };
    
    // Convert arrays to comma-separated strings for text inputs
    if (sectionKey === 'patient_info' && Array.isArray(dataToEdit.race)) {
        dataToEdit.race = dataToEdit.race.join(', ');
    }
    if (sectionKey === 'adverse_event') {
        if (Array.isArray(dataToEdit.problem_type)) dataToEdit.problem_type = dataToEdit.problem_type.join(', ');
        if (Array.isArray(dataToEdit.outcomes)) dataToEdit.outcomes = dataToEdit.outcomes.join(', ');
    }
     if (sectionKey === 'suspect_product' && Array.isArray(dataToEdit.product_type)) {
        dataToEdit.product_type = dataToEdit.product_type.join(', ');
    }

    setEditedData(dataToEdit);
    setEditingSection(sectionKey);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedData(null);
  };

  const handleSave = () => {
    if (!editingSection || !onUpdateReport) return;
    
    let finalEditedData = { ...editedData };

    // Convert comma-separated strings back to arrays
    if (editingSection === 'patient_info' && typeof finalEditedData.race === 'string') {
        finalEditedData.race = finalEditedData.race.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (editingSection === 'adverse_event') {
        if (typeof finalEditedData.problem_type === 'string') finalEditedData.problem_type = finalEditedData.problem_type.split(',').map(s => s.trim()).filter(Boolean);
        if (typeof finalEditedData.outcomes === 'string') finalEditedData.outcomes = finalEditedData.outcomes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (editingSection === 'suspect_product' && typeof finalEditedData.product_type === 'string') {
        finalEditedData.product_type = finalEditedData.product_type.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    const updatedReportData = {
        ...data,
        [editingSection]: finalEditedData,
    };
    onUpdateReport(updatedReportData);
    setEditingSection(null);
    setEditedData(null);
  };
  
  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderEditControls = () => (
    <div className="flex justify-end items-center gap-3 mt-4 pt-4 border-t border-border">
        <button onClick={handleCancel} className="font-semibold text-sm text-text-muted hover:text-text px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
        <button onClick={handleSave} className="font-semibold text-sm text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md transition-colors shadow-sm">Save Changes</button>
    </div>
  );

  return (
    <div className="bg-surface rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text">Live Data Report</h2>
      </div>
      <div className="flex-grow p-4 lg:p-6 overflow-y-auto space-y-6">
        {!isReviewMode && (
          <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-text-muted">
                  <span>Progress</span>
                  <span>{progress}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
          </div>
        )}
        
        <Section title="About the Patient" icon={<UserIcon />} onEdit={!isReviewMode ? () => handleEditClick('patient_info', data.patient_info) : undefined} isEditing={editingSection === 'patient_info'}>
            {editingSection === 'patient_info' ? (
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <label className={labelClasses}>Initials</label><input type="text" value={editedData.initials || ''} onChange={e => handleFieldChange('initials', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Age</label><input type="number" value={editedData.age || ''} onChange={e => handleFieldChange('age', e.target.valueAsNumber || null)} className={inputClasses} />
                        <label className={labelClasses}>Date of Birth</label><input type="date" value={editedData.dob || ''} onChange={e => handleFieldChange('dob', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Sex</label><select value={editedData.sex || ''} onChange={e => handleFieldChange('sex', e.target.value)} className={inputClasses}><option value="">Select...</option><option>Male</option><option>Female</option><option>Unknown</option></select>
                        <label className={labelClasses}>Weight</label><input type="number" value={editedData.weight || ''} onChange={e => handleFieldChange('weight', e.target.valueAsNumber || null)} className={inputClasses} />
                        <label className={labelClasses}>Weight Unit</label><select value={editedData.weight_unit || ''} onChange={e => handleFieldChange('weight_unit', e.target.value)} className={inputClasses}><option value="">Select...</option><option>kg</option><option>lbs</option></select>
                        <label className={labelClasses}>Race</label><input type="text" placeholder="Comma-separated" value={editedData.race || ''} onChange={e => handleFieldChange('race', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Ethnicity</label><select value={editedData.ethnicity || ''} onChange={e => handleFieldChange('ethnicity', e.target.value)} className={inputClasses}><option value="">Select...</option><option>Hispanic or Latino</option><option>Not Hispanic or Latino</option><option>Unknown</option></select>
                    </div>
                    <label className={labelClasses}>Allergies</label><textarea value={editedData.allergies || ''} onChange={e => handleFieldChange('allergies', e.target.value)} className={inputClasses} rows={2}></textarea>
                    <label className={labelClasses}>Medical Conditions</label><textarea value={editedData.medical_conditions || ''} onChange={e => handleFieldChange('medical_conditions', e.target.value)} className={inputClasses} rows={2}></textarea>
                    {renderEditControls()}
                </div>
            ) : <DataRenderer data={data.patient_info} />}
        </Section>

        <Section title="About the Problem" icon={<AlertTriangleIcon />} onEdit={!isReviewMode ? () => handleEditClick('adverse_event', data.adverse_event) : undefined} isEditing={editingSection === 'adverse_event'}>
            {editingSection === 'adverse_event' ? (
                 <div className="space-y-3 text-sm">
                    <label className={labelClasses}>Problem Type</label><input type="text" placeholder="Comma-separated" value={editedData.problem_type || ''} onChange={e => handleFieldChange('problem_type', e.target.value)} className={inputClasses} />
                    <label className={labelClasses}>Outcomes</label><input type="text" placeholder="Comma-separated" value={editedData.outcomes || ''} onChange={e => handleFieldChange('outcomes', e.target.value)} className={inputClasses} />
                    <label className={labelClasses}>Event Onset Date</label><input type="date" value={editedData.event_onset_date || ''} onChange={e => handleFieldChange('event_onset_date', e.target.value)} className={inputClasses} />
                    <label className={labelClasses}>Description</label><textarea value={editedData.description_narrative || ''} onChange={e => handleFieldChange('description_narrative', e.target.value)} className={inputClasses} rows={3}></textarea>
                     {renderEditControls()}
                 </div>
            ) : <DataRenderer data={data.adverse_event} />}
        </Section>
        
        <Section title="About the Product" icon={<PillIcon />} onEdit={!isReviewMode ? () => handleEditClick('suspect_product', data.suspect_product) : undefined} isEditing={editingSection === 'suspect_product'}>
             {editingSection === 'suspect_product' ? (
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                       <label className={labelClasses}>Name</label><input type="text" value={editedData.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Manufacturer</label><input type="text" value={editedData.manufacturer || ''} onChange={e => handleFieldChange('manufacturer', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Product Type</label><input type="text" placeholder="Comma-separated" value={editedData.product_type || ''} onChange={e => handleFieldChange('product_type', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>NDC Number</label><input type="text" value={editedData.ndc_number || ''} onChange={e => handleFieldChange('ndc_number', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Dose</label><input type="text" value={editedData.dose || ''} onChange={e => handleFieldChange('dose', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Route</label><input type="text" value={editedData.route || ''} onChange={e => handleFieldChange('route', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Therapy Start</label><input type="date" value={editedData.therapy_start_date || ''} onChange={e => handleFieldChange('therapy_start_date', e.target.value)} className={inputClasses} />
                       <label className={labelClasses}>Therapy End</label><input type="date" value={editedData.therapy_end_date || ''} onChange={e => handleFieldChange('therapy_end_date', e.target.value)} className={inputClasses} />
                    </div>
                     <label className={labelClasses}>Reason for Use</label><textarea value={editedData.reason_for_use || ''} onChange={e => handleFieldChange('reason_for_use', e.target.value)} className={inputClasses} rows={2}></textarea>
                    {renderEditControls()}
                </div>
            ) : (
                <>
                    <DataRenderer data={data.suspect_product} />
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <span className="text-text-muted font-medium">Product Available:</span>
                      <ValueDisplay value={data.product_available} />
                    </div>
                </>
            )}
        </Section>

        <Section title="Other Medications" icon={<ListPlusIcon />} isEditable={false}>
            <DataRenderer data={{ products: data.concomitant_products }} />
        </Section>

        <Section title="About the Reporter" icon={<ReporterIcon />} onEdit={!isReviewMode ? () => handleEditClick('reporter_info', data.reporter_info) : undefined} isEditing={editingSection === 'reporter_info'}>
             {editingSection === 'reporter_info' ? (
                <div className="space-y-3 text-sm">
                     {user && (
                       <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                         <p className="text-blue-800 text-xs font-medium mb-1">📝 Auto-filled from your profile</p>
                         <p className="text-blue-700 text-xs">These fields were automatically populated from your account information. You can modify them if needed.</p>
                       </div>
                     )}
                     <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <label className={labelClasses}>First Name</label><input type="text" value={editedData.first_name || ''} onChange={e => handleFieldChange('first_name', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Last Name</label><input type="text" value={editedData.last_name || ''} onChange={e => handleFieldChange('last_name', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Email</label><input type="email" value={editedData.email || ''} onChange={e => handleFieldChange('email', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Phone</label><input type="tel" value={editedData.phone || ''} onChange={e => handleFieldChange('phone', e.target.value)} className={inputClasses} />
                        <label className={labelClasses}>Country</label><input type="text" value={editedData.country || ''} onChange={e => handleFieldChange('country', e.target.value)} className={inputClasses} />
                    </div>
                    {renderEditControls()}
                </div>
             ) : (
               <>
                 {user && (data.reporter_info.first_name || data.reporter_info.last_name || data.reporter_info.email) && (
                   <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                     <p className="text-green-800 text-xs font-medium">✅ Auto-filled from your profile</p>
                   </div>
                 )}
                 <DataRenderer data={data.reporter_info} />
               </>
             )}
        </Section>
        
      </div>
      {!isReviewMode && (
        <div className="p-3 border-t border-border bg-background text-center">
            <p className="text-xs text-text-muted">Data is updated in real-time. Click the <PencilIcon inline={true} /> icon to edit a section.</p>
            <p className="text-xs text-green-600 mt-1">✓ The AI will automatically recognize fields you've filled out and won't ask about them again.</p>
        </div>
      )}
    </div>
  );
};

export default ReportPanel;
