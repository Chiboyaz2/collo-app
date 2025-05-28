import type { NextApiRequest, NextApiResponse } from 'next';

type LoginResponse = {
  status: string;
  message: {
    token: string;
    admin: {
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
    };
  };
  data: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | { error: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the request to the actual API
    const apiResponse = await fetch('https://test.colloafrica.com/api/v1/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Handle non-OK responses
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return res.status(apiResponse.status).json({ 
        error: errorData.message || 'Login failed' 
      });
    }

    // Return the successful response
    const data: LoginResponse = await apiResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}