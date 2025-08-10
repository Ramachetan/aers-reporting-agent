import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, ChevronDown, Shield, BarChart3 } from 'lucide-react'
import { calculateProfileCompletionPercentage } from '../constants'
import ProfileManager from './ProfileManager'

interface UserProfileProps {
  showProfileCompletion?: boolean
}

const UserProfile: React.FC<UserProfileProps> = ({ showProfileCompletion = false }) => {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  // Calculate profile completion
  const completionPercentage = calculateProfileCompletionPercentage(user)
  const isProfileIncomplete = completionPercentage < 80

  const displayName = user.user_metadata?.full_name || 
    (user.user_metadata?.first_name && user.user_metadata?.last_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email?.split('@')[0] || 'User')

  const displayProfession = user.user_metadata?.profession ? 
    `${user.user_metadata.profession} • ${user.email}` : 
    user.email

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Main Profile Display */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-surface/50 rounded-lg transition-colors p-1"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-border">
            <div className="relative">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              {/* Profile completion indicator */}
              {showProfileCompletion && isProfileIncomplete && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" 
                     title={`Profile ${completionPercentage}% complete`} />
              )}
            </div>
            <div className="text-sm">
              <div className="font-medium text-text flex items-center gap-1">
                {displayName}
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </div>
              <div className="text-xs text-text-muted">
                {displayProfession}
              </div>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-lg shadow-lg border border-border z-50">
            {/* Profile Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text">{displayName}</div>
                  <div className="text-sm text-text-muted">{user.email}</div>
                  {user.user_metadata?.profession && (
                    <div className="text-xs text-primary">{user.user_metadata.profession}</div>
                  )}
                </div>
              </div>
              
              {/* Profile Completion Bar */}
              {showProfileCompletion && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text">Profile Completion</span>
                    <span className="text-xs text-text-muted">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        completionPercentage >= 80 ? 'bg-green-500' : 
                        completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  {isProfileIncomplete && (
                    <p className="text-xs text-text-muted mt-1">
                      Complete your profile to auto-fill reports faster
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setIsProfileManagerOpen(true)
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-text-muted" />
                <div>
                  <div className="text-sm font-medium text-text">Manage Profile</div>
                  <div className="text-xs text-text-muted">Update personal and professional info</div>
                </div>
              </button>

              <button
                onClick={() => {
                  // TODO: Implement report history
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-text-muted" />
                <div>
                  <div className="text-sm font-medium text-text">Report History</div>
                  <div className="text-xs text-text-muted">View your previous submissions</div>
                </div>
              </button>

              <button
                onClick={() => {
                  // TODO: Implement privacy settings
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4 text-text-muted" />
                <div>
                  <div className="text-sm font-medium text-text">Privacy Settings</div>
                  <div className="text-xs text-text-muted">Control your data sharing preferences</div>
                </div>
              </button>

              <hr className="my-2 border-border" />

              <button
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium">Sign Out</div>
                  <div className="text-xs text-red-500">End your current session</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Manager Modal */}
      <ProfileManager
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        onProfileUpdate={(updated) => {
          if (updated) {
            // Could trigger a refresh or show success message
            console.log('Profile updated successfully')
          }
        }}
      />
    </>
  )
}

export default UserProfile
