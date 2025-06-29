'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Check, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '../../public/logo white.png'
import Image from 'next/image';

interface LoginData {
  email: string;
  password: string;
  remember: boolean;
}

interface AdminData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_role_id: number;
  admin_role_id: number;
  email_verified_at: string;
  is_suspended: number;
  status: string;
  otp: string | null;
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LoginResponse {
  status: string;
  message: {
    token: string;
    admin: AdminData;
  } | string | null;
  data: string;
}
 
export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    remember: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('Submitting form data:', formData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember
        }),
        credentials: 'include'
      });

      const result: LoginResponse = await response.json();
      console.log('Server response:', result);

      if (!response.ok) {
        // Handle error response
        const errorMessage = result.data || 'Invalid email or password';
        throw new Error(errorMessage);
      }

      if (result.status === 'success' && typeof result.message === 'object' && result.message?.token) {
        // Store token and admin data in localStorage
        localStorage.setItem('collo-admin-token', result.message.token);
        localStorage.setItem('collo-admin-data', JSON.stringify(result.message.admin));
        
        // Set success state
        setIsSuccess(true);
        
        // On successful login, navigate to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(result.data || 'Invalid response format');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#470B96] to-[#470B96]/70 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-40 w-40 ">
            <Image src={Logo} alt='h-full w-full'/>
          </div>
          <h1 className="text-white text-2xl font-bold">Collo Admin Portal</h1>
          <p className="text-blue-100 mt-2">Log in to manage your platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform hover:shadow-xl">
          {/* Card Header */}
          <div className="bg-[#470B96] p-4">
            <h2 className="text-white text-lg font-medium">Administrator Access</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-[#1A365D] transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-[#1A365D] transition-all duration-200"
                    placeholder="••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`mr-3 h-5 w-5 rounded border ${
                    formData.remember
                      ? 'bg-[#470B96] border-[#470B96]'
                      : 'border-gray-300'
                  } flex items-center justify-center transition-colors duration-200`}
                >
                  {formData.remember && <Check size={14} className="text-white" />}
                </div>
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-[#E53E3E] p-3 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg flex items-start">
                <Check size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Login successful! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full bg-[#470B96] hover:bg-[#470B96]/85 text-white py-3 px-4 rounded-lg cursor-pointer flex items-center justify-center transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecting...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In <ArrowRight size={18} className="ml-2" />
                </span>
              )}
            </button>
          </form>

          <div className="bg-gray-50 p-4">
            <p className="text-center text-sm text-gray-600">
              Administrator portal for system management
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-blue-100 mt-6">
          © {new Date().getFullYear()} Collo. All rights reserved.
        </p>
      </div>
    </div>
  );
}