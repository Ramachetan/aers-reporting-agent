import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import { calculateProfileCompletionPercentage } from '../constants'
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  Shield, Save, X, Edit3, Check, AlertCircle,
  Settings, Globe, Building
} from 'lucide-react'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  country?: string
  profession?: string
  license_number?: string
  institution?: string
  specialization?: string
  preferred_contact_method?: 'email' | 'phone' | 'both'
  address?: string
  city?: string
  state?: string
  zip_code?: string
  reported_to_manufacturer_preference?: boolean
  permission_to_share_identity_preference?: boolean
  privacy_settings?: {
    share_contact_info: boolean
    allow_follow_up: boolean
    share_with_research: boolean
  }
}

interface ProfileManagerProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate?: (updated: boolean) => void
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    reported_to_manufacturer_preference: false,
    permission_to_share_identity_preference: false,
    privacy_settings: {
      share_contact_info: true,
      allow_follow_up: true,
      share_with_research: false
    }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'contact' | 'privacy'>('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {}
      setProfileData({
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
        date_of_birth: metadata.date_of_birth || '',
        country: metadata.country || '',
        profession: metadata.profession || '',
        license_number: metadata.license_number || '',
        institution: metadata.institution || '',
        specialization: metadata.specialization || '',
        preferred_contact_method: metadata.preferred_contact_method || 'email',
        address: metadata.address || '',
        city: metadata.city || '',
        state: metadata.state || '',
        zip_code: metadata.zip_code || '',
        reported_to_manufacturer_preference: metadata.reported_to_manufacturer_preference ?? false,
        permission_to_share_identity_preference: metadata.permission_to_share_identity_preference ?? false,
        privacy_settings: {
          share_contact_info: metadata.privacy_settings?.share_contact_info ?? true,
          allow_follow_up: metadata.privacy_settings?.allow_follow_up ?? true,
          share_with_research: metadata.privacy_settings?.share_with_research ?? false
        }
      })
    }
  }, [user])

  // Calculate profile completion percentage
  const completionPercentage = calculateProfileCompletionPercentage(user)

  // Helper to determine if professional fields should be shown
  const shouldShowProfessionalFields = () => {
    const profession = profileData.profession
    const professionalRoles = [
      'physician', 'nurse', 'pharmacist', 'physician_assistant', 
      'nurse_practitioner', 'dentist', 'veterinarian', 'healthcare_professional',
      'researcher', 'lawyer', 'regulatory_affairs', 'pharmaceutical_industry'
    ]
    return profession && professionalRoles.includes(profession)
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: profileData
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        onProfileUpdate?.(true)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const updateProfileField = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updatePrivacySetting = (setting: keyof NonNullable<ProfileData['privacy_settings']>, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings!,
        [setting]: value
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Profile Management</h2>
              <p className="text-white/80">
                {profileData.first_name || profileData.last_name 
                  ? `${profileData.first_name} ${profileData.last_name}`.trim()
                  : profileData.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-gray-50 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">Profile Completion</span>
            <span className="text-sm text-text-muted">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage < 80 && (
            <p className="text-xs text-text-muted mt-1">
              Complete your profile to auto-fill future reports faster
            </p>
          )}
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 p-4 border-r border-border">
            <nav className="space-y-2">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'professional', label: 'Professional & Reporting', icon: Briefcase },
                { id: 'contact', label: 'Contact & Address', icon: MapPin },
                { id: 'privacy', label: 'Privacy Settings', icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === id
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                {message}
              </div>
            )}

            {/* Edit Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text">
                {activeSection === 'personal' && 'Personal Information'}
                {activeSection === 'professional' && 'Professional & Reporting Preferences'}
                {activeSection === 'contact' && 'Contact & Address'}
                {activeSection === 'privacy' && 'Privacy Settings'}
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => updateProfileField('first_name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => updateProfileField('last_name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-text-muted mt-1">Email cannot be changed here. Contact support if needed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={profileData.date_of_birth || ''}
                    onChange={(e) => updateProfileField('date_of_birth', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Country</label>
                  <select
                    value={profileData.country || ''}
                    onChange={(e) => updateProfileField('country', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                    <option value="FI">Finland</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                    <option value="SG">Singapore</option>
                    <option value="NZ">New Zealand</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Professional Information Section */}
            {activeSection === 'professional' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Profession</label>
                  <select
                    value={profileData.profession || ''}
                    onChange={(e) => updateProfileField('profession', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select your profession</option>
                    <option value="physician">Physician/Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="physician_assistant">Physician Assistant</option>
                    <option value="nurse_practitioner">Nurse Practitioner</option>
                    <option value="dentist">Dentist</option>
                    <option value="veterinarian">Veterinarian</option>
                    <option value="healthcare_professional">Other Healthcare Professional</option>
                    <option value="researcher">Medical Researcher</option>
                    <option value="patient">Patient</option>
                    <option value="caregiver">Caregiver/Family Member</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="regulatory_affairs">Regulatory Affairs</option>
                    <option value="pharmaceutical_industry">Pharmaceutical Industry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {shouldShowProfessionalFields() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Specialization (Optional)</label>
                      <input
                        type="text"
                        value={profileData.specialization || ''}
                        onChange={(e) => updateProfileField('specialization', e.target.value)}
                        disabled={!isEditing}
                        placeholder="e.g., Cardiology, Pediatrics, Internal Medicine"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Institution/Practice (Optional)</label>
                      <input
                        type="text"
                        value={profileData.institution || ''}
                        onChange={(e) => updateProfileField('institution', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Hospital, clinic, or practice name"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">License Number (Optional)</label>
                      <input
                        type="text"
                        value={profileData.license_number || ''}
                        onChange={(e) => updateProfileField('license_number', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Professional license number"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <p className="text-xs text-text-muted mt-1">This information is encrypted and used only for verification purposes.</p>
                    </div>
                  </>
                )}

                {/* Reporter Preferences Section */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium text-text mb-4">Reporting Preferences</h4>
                  <p className="text-sm text-text-muted mb-4">
                    These preferences will be used as defaults when creating reports. You can always change them for individual reports.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-text">Default: Report to Manufacturer</h5>
                        <p className="text-sm text-text-muted mt-1">
                          By default, indicate that you have reported or will report this issue to the product manufacturer.
                        </p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.reported_to_manufacturer_preference || false}
                          onChange={(e) => updateProfileField('reported_to_manufacturer_preference', e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                        />
                      </label>
                    </div>

                    <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-text">Default: Permission to Share Identity</h5>
                        <p className="text-sm text-text-muted mt-1">
                          By default, allow the FDA to share your identity with the product manufacturer for follow-up.
                        </p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.permission_to_share_identity_preference || false}
                          onChange={(e) => updateProfileField('permission_to_share_identity_preference', e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Address Section */}
            {activeSection === 'contact' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => updateProfileField('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Preferred Contact Method</label>
                  <select
                    value={profileData.preferred_contact_method || 'email'}
                    onChange={(e) => updateProfileField('preferred_contact_method', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both Email and Phone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    value={profileData.address || ''}
                    onChange={(e) => updateProfileField('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">City</label>
                    <input
                      type="text"
                      value={profileData.city || ''}
                      onChange={(e) => updateProfileField('city', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">State/Province</label>
                    <input
                      type="text"
                      value={profileData.state || ''}
                      onChange={(e) => updateProfileField('state', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={profileData.zip_code || ''}
                    onChange={(e) => updateProfileField('zip_code', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Privacy Settings Section */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Your Privacy Matters</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        These settings control how your information is used and shared. All data is encrypted and handled in compliance with healthcare privacy standards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-text">Share Contact Information</h4>
                      <p className="text-sm text-text-muted mt-1">
                        Allow your contact information to be shared with regulatory agencies for follow-up on reports.
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.privacy_settings?.share_contact_info || false}
                        onChange={(e) => updatePrivacySetting('share_contact_info', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-text">Allow Follow-up Contact</h4>
                      <p className="text-sm text-text-muted mt-1">
                        Permit regulatory agencies to contact you for additional information about your reports.
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.privacy_settings?.allow_follow_up || false}
                        onChange={(e) => updatePrivacySetting('allow_follow_up', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-text">Share with Research</h4>
                      <p className="text-sm text-text-muted mt-1">
                        Allow anonymized data from your reports to be used for medical research (your identity remains protected).
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.privacy_settings?.share_with_research || false}
                        onChange={(e) => updatePrivacySetting('share_with_research', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 border border-border rounded-lg p-4">
                  <h4 className="font-medium text-text mb-2">Data Rights</h4>
                  <p className="text-sm text-text-muted mb-3">
                    You have the right to access, update, or delete your personal data at any time.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-border rounded hover:bg-white transition-colors">
                      Export My Data
                    </button>
                    <button className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="p-4 bg-gray-50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Changes will auto-fill future reports for faster submission
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-text border border-border rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileManager
