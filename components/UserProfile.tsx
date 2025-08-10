import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-border">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-text">
            {user.user_metadata?.full_name || 
             (user.user_metadata?.first_name && user.user_metadata?.last_name 
               ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
               : user.email?.split('@')[0] || 'User')}
          </div>
          <div className="text-xs text-text-muted">
            {user.user_metadata?.profession ? 
              `${user.user_metadata.profession} • ${user.email}` : 
              user.email}
          </div>
        </div>
      </div>
      
      <button
        onClick={signOut}
        className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-primary transition-colors border border-border"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}

export default UserProfile
