import React, { useState } from 'react';
import { useForm, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FormData {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ApiResponse {
  status: string;
  message: unknown;
  data: string;
}

const Password = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const { register, handleSubmit, watch, formState: { errors }, setError, reset } = useForm<FormData>();
    
    const newPassword = watch("new_password", "");

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setSuccessMessage(null); // Reset success message on new submission
        try {
            const token = localStorage.getItem('collo-admin-token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const endpoint = `${baseUrl}/admin/change-password`;

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({
                "old_password": data.old_password,
                "new_password": data.new_password,
                "new_password_confirmation": data.new_password_confirmation
            });

            const requestOptions: RequestInit = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow" as RequestRedirect
            };

            const response = await fetch(endpoint, requestOptions);
            const result: ApiResponse = await response.json();

            console.log('Server Response:', result);

            if (response.ok) {
                // Success case - show the message from data field
                const message = result.data || 'Password changed successfully!';
                setSuccessMessage(message);
                toast.success(message);
                reset(); // Clear the form
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Error case - show the message from data field
                const errorMessage = result.data || 'Failed to change password';
                
                // Handle specific error cases
                if (errorMessage.includes('Old password')) {
                    setError('old_password', {
                        type: 'manual',
                        message: errorMessage
                    });
                } else if (errorMessage.includes('confirmation')) {
                    setError('new_password_confirmation', {
                        type: 'manual',
                        message: errorMessage
                    });
                }
                
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while changing password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderError = (error: FieldError | Merge<FieldError, FieldErrorsImpl<never>> | undefined) => {
        return error && <p className="mt-1 text-sm text-red-600">{error.message as React.ReactNode}</p>;
    };

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        switch (field) {
            case 'old':
                setShowOldPassword(!showOldPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Change Password</h2>
            
            {/* Success message banner at the top */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            id="old_password"
                            {...register("old_password", { required: "Current password is required" })}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                            onClick={() => togglePasswordVisibility('old')}
                        >
                            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {renderError(errors.old_password)}
                </div>

                <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            id="new_password"
                            {...register("new_password", { 
                                required: "New password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                }
                            })}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {renderError(errors.new_password)}
                </div>

                <div>
                    <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="new_password_confirmation"
                            {...register("new_password_confirmation", { 
                                required: "Please confirm your new password",
                                validate: value => 
                                    value === newPassword || "The passwords do not match"
                            })}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {renderError(errors.new_password_confirmation)}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 cursor-pointer px-4 rounded-md text-white font-medium ${isLoading ? 'bg-[#470B96]/80' : 'bg-[#470B96] hover:bg-[#470B96]/90'} focus:outline-none focus:ring-2 focus:ring-[#470B96] focus:ring-offset-2`}
                >
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default Password;