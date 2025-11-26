import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnboardingFormProps {
  user: {
    email: string;
    id: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
  onComplete: () => void;
}

interface FormData {
  businessName: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  industry: string;
  addressNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  termsAccepted: boolean;
}

const INDUSTRIES = [
  '',
  'Carpet Cleaning',
  'Home Repair',
  'Landscaping',
  'Mobile Car Detailing',
  'Mobile Massage',
  'Personal Trainer',
  'Pet Chef/MealPrep',
  'Pet Grooming',
  'Pet Walking',
  'Salon Services',
  'Personal Training',
  'Tutoring',
  'Window Cleaning',
  'Other',
];

const US_STATES = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'AL - Alabama' },
  { value: 'AK', label: 'AK - Alaska' },
  { value: 'AZ', label: 'AZ - Arizona' },
  { value: 'AR', label: 'AR - Arkansas' },
  { value: 'CA', label: 'CA - California' },
  { value: 'CO', label: 'CO - Colorado' },
  { value: 'CT', label: 'CT - Connecticut' },
  { value: 'DE', label: 'DE - Delaware' },
  { value: 'FL', label: 'FL - Florida' },
  { value: 'GA', label: 'GA - Georgia' },
  { value: 'HI', label: 'HI - Hawaii' },
  { value: 'ID', label: 'ID - Idaho' },
  { value: 'IL', label: 'IL - Illinois' },
  { value: 'IN', label: 'IN - Indiana' },
  { value: 'IA', label: 'IA - Iowa' },
  { value: 'KS', label: 'KS - Kansas' },
  { value: 'KY', label: 'KY - Kentucky' },
  { value: 'LA', label: 'LA - Louisiana' },
  { value: 'ME', label: 'ME - Maine' },
  { value: 'MD', label: 'MD - Maryland' },
  { value: 'MA', label: 'MA - Massachusetts' },
  { value: 'MI', label: 'MI - Michigan' },
  { value: 'MN', label: 'MN - Minnesota' },
  { value: 'MS', label: 'MS - Mississippi' },
  { value: 'MO', label: 'MO - Missouri' },
  { value: 'MT', label: 'MT - Montana' },
  { value: 'NE', label: 'NE - Nebraska' },
  { value: 'NV', label: 'NV - Nevada' },
  { value: 'NH', label: 'NH - New Hampshire' },
  { value: 'NJ', label: 'NJ - New Jersey' },
  { value: 'NM', label: 'NM - New Mexico' },
  { value: 'NY', label: 'NY - New York' },
  { value: 'NC', label: 'NC - North Carolina' },
  { value: 'ND', label: 'ND - North Dakota' },
  { value: 'OH', label: 'OH - Ohio' },
  { value: 'OK', label: 'OK - Oklahoma' },
  { value: 'OR', label: 'OR - Oregon' },
  { value: 'PA', label: 'PA - Pennsylvania' },
  { value: 'RI', label: 'RI - Rhode Island' },
  { value: 'SC', label: 'SC - South Carolina' },
  { value: 'SD', label: 'SD - South Dakota' },
  { value: 'TN', label: 'TN - Tennessee' },
  { value: 'TX', label: 'TX - Texas' },
  { value: 'UT', label: 'UT - Utah' },
  { value: 'VT', label: 'VT - Vermont' },
  { value: 'VA', label: 'VA - Virginia' },
  { value: 'WA', label: 'WA - Washington' },
  { value: 'WV', label: 'WV - West Virginia' },
  { value: 'WI', label: 'WI - Wisconsin' },
  { value: 'WY', label: 'WY - Wyoming' },
  { value: 'DC', label: 'DC - District of Columbia' },
];

export default function OnboardingForm({ user, onLogout, onComplete }: OnboardingFormProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Onboarding');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    customerName: user.user_metadata?.full_name || '',
    email: user.email,
    phoneNumber: '',
    industry: '',
    addressNumber: '',
    streetName: '',
    city: '',
    state: '',
    zipCode: '',
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
  };

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsEditMode(true);
        setFormData({
          businessName: data.business_name,
          customerName: data.customer_name,
          email: data.email,
          phoneNumber: data.phone_number,
          industry: data.industry,
          addressNumber: data.address_number || '',
          streetName: data.street_name || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zip_code || '',
          termsAccepted: data.terms_accepted,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    if (formData.businessName.length < 3) {
      setError('Business name must be at least 3 characters');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }

    if (!formData.industry) {
      setError('Please select an industry');
      return false;
    }

    if (!formData.addressNumber.trim()) {
      setError('Address number is required');
      return false;
    }

    if (!formData.streetName.trim()) {
      setError('Street name is required');
      return false;
    }

    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }

    if (!formData.state) {
      setError('Please select a state');
      return false;
    }

    if (!formData.zipCode.trim()) {
      setError('Zip code is required');
      return false;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const profileData = {
        user_id: user.id,
        business_name: formData.businessName,
        customer_name: formData.customerName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        industry: formData.industry,
        address_number: formData.addressNumber,
        street_name: formData.streetName,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        terms_accepted: formData.termsAccepted,
        business_configured: true,
      };

      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (profileError) throw profileError;

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Profile Updated!' : 'Welcome to AdminEase!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isEditMode
              ? 'Your business profile has been successfully updated. Redirecting to your dashboard...'
              : 'Your business profile has been successfully configured. Redirecting to your dashboard...'}
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                AdminEase
              </span>
            </button>

            <nav className="hidden md:flex items-center space-x-1">
              {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleNavigate(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'text-cyan-600 border-cyan-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showMobileMenu ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col space-y-1">
                {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleNavigate(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all ${
                      activeTab === tab
                        ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit Your Business Profile' : 'Complete Your Business Profile'}
            </h1>
            <p className="text-gray-600">
              {isEditMode
                ? 'Update your business information and documents as needed.'
                : 'Help us understand your business better by providing the following information.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-cyan-600" />
                <span>Customer Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="md:col-span-2">
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="customerName"
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Line of Business <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm appearance-none"
                    >
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry || 'Select industry...'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Address Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <span>Business Address</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Number */}
                <div>
                  <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Address Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="addressNumber"
                    required
                    value={formData.addressNumber}
                    onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                    placeholder="123"
                  />
                </div>

                {/* Street Name */}
                <div>
                  <label htmlFor="streetName" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="streetName"
                    required
                    value={formData.streetName}
                    onChange={(e) => handleInputChange('streetName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                    placeholder="Main Street"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                    placeholder="New York"
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm appearance-none"
                  >
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zip Code */}
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                    placeholder="10001"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Submission */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-start space-x-3 mb-6">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 mt-1"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isEditMode ? 'Updating your profile...' : 'Setting up your profile...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isEditMode ? 'Save Changes' : 'Complete Onboarding'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
