import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Logo } from './Icons'
import { Mail, Lock, Eye, EyeOff, User, Calendar, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LoginProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // Additional sign-up fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [country, setCountry] = useState('')
  const [profession, setProfession] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  
  const { user } = useAuth()

  // Redirect to success when user is authenticated
  useEffect(() => {
    if (user && onSuccess) {
      onSuccess()
    }
  }, [user, onSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        // Validate additional fields for sign-up
        if (!firstName.trim() || !lastName.trim()) {
          setError('Please enter your first and last name')
          setLoading(false)
          return
        }
        
        if (!agreeToTerms) {
          setError('Please agree to the terms and conditions')
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: `${firstName.trim()} ${lastName.trim()}`,
              date_of_birth: dateOfBirth || null,
              country: country || null,
              profession: profession || null,
            }
          }
        })
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for the confirmation link!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">{/* Increased width for additional fields */}
        {/* Back to Home Button */}
        {onBack && (
          <div className="mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
        )}
        
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">AERS Reporting Agent</h1>
            <p className="text-text-muted">
              {isSignUp ? 'Create an account to start reporting' : 'Sign in to securely report medication side effects'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Additional fields for sign-up */}
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-text mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-text mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text mb-2">
                    Date of Birth (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-text mb-2">
                    Country (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
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

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-text mb-2">
                    Profession (Optional)
                  </label>
                  <select
                    id="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                  >
                    <option value="">Select your profession</option>
                    <option value="healthcare_professional">Healthcare Professional</option>
                    <option value="physician">Physician</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="patient">Patient</option>
                    <option value="caregiver">Caregiver/Family Member</option>
                    <option value="researcher">Researcher</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                Email {isSignUp && '*'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Password {isSignUp && '*'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-text-muted">
                  Password should be at least 6 characters long
                </p>
              )}
            </div>

            {/* Terms and conditions for sign-up */}
            {isSignUp && (
              <div className="flex items-start gap-3">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary focus:ring-primary border-border rounded"
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm text-text">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </a>{' '}
                  and understand that my information will be used in accordance with healthcare privacy standards. *
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setMessage('')
                // Clear additional fields when switching modes
                setFirstName('')
                setLastName('')
                setDateOfBirth('')
                setCountry('')
                setProfession('')
                setAgreeToTerms(false)
              }}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-sm text-text-muted">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-border text-text py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Your data is securely encrypted and protected in compliance with healthcare privacy standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
