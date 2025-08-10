import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { calculateProfileCompletionPercentage, getMissingProfileFields } from '../constants'
import { User, Star, Clock, Shield, X, ArrowRight, Check } from 'lucide-react'
import ProfileManager from './ProfileManager'

interface ProfileEnhancementPromptProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const ProfileEnhancementPrompt: React.FC<ProfileEnhancementPromptProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { user } = useAuth()
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isOpen || !user || isDismissed) return null

  // Calculate profile completion
  const completionPercentage = calculateProfileCompletionPercentage(user)
  const isProfileIncomplete = completionPercentage < 80
  const missingFields = getMissingProfileFields(user)

  // Don't show if profile is already well completed
  if (!isProfileIncomplete) return null

  const handleEnhanceProfile = () => {
    setIsProfileManagerOpen(true)
  }

  const handleMaybeLater = () => {
    setIsDismissed(true)
    onClose()
  }

  const handleProfileUpdate = (updated: boolean) => {
    if (updated) {
      setIsProfileManagerOpen(false)
      setIsDismissed(true)
      onComplete()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Great job completing your report!</h3>
            </div>
            <p className="text-blue-100 text-sm">
              Make future reports even faster by completing your profile
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Profile Completion Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">Profile Completion</span>
                <span className="text-sm text-text-muted">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="font-medium text-text">Complete your profile to:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-text">Auto-fill future reports in seconds</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-text">Set your privacy preferences</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="text-text">Add professional credentials</span>
                </div>
              </div>
            </div>

            {/* Missing Fields Hint */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>Quick wins:</strong> {missingFields.length > 0 
                  ? `Add ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ' and more' : ''} to boost your completion to 90%+`
                  : 'Complete a few more fields to reach 90%+ completion'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handleMaybeLater}
              className="flex-1 px-4 py-2 text-text border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleEnhanceProfile}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Manager Modal */}
      <ProfileManager
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  )
}

export default ProfileEnhancementPrompt
