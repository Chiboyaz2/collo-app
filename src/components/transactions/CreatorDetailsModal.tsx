import React from 'react';
import { Modal } from 'antd';
import { format, parseISO } from 'date-fns';

interface Creator {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  dob: string | null;
  gender: string | null;
  marital_status: string | null;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  phone_verified_at: string | null;
  id_number: string | null;
  id_type: string | null;
  address: string | null;
  nearest_landmark: string | null;
  lga: string | null;
  state: string | null;
  nationality: string | null;
  home_town: string | null;
  occupation: string | null;
  employer: string | null;
  employer_address: string | null;
  nok_name: string | null;
  nok_phone_number: string | null;
  nok_email: string | null;
  nok_address: string | null;
  nok_relationship: string | null;
  referral_code: string | null;
  kyc_status: number;
  nin_verification_status: number;
  bvn_verification_status: number;
  created_at: string;
  updated_at: string;
  signup_referral_code: string | null;
  nin_data: string | null;
  deleted_at: string | null;
  user_role_id: number;
}

interface CreatorDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  creator: Creator | null;
}

const CreatorDetailsModal: React.FC<CreatorDetailsModalProps> = ({ visible, onCancel, creator }) => {
  const getKycStatus = (status: number) => {
    return status === 1 ? 'Verified' : 'Not Verified';
  };

  return (
    <div className="fixed  z-[2000] flex items-center justify-center p-4">
      <Modal
        title="Admin Details"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        {creator && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">First Name</h4>
                <p>{creator.first_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Last Name</h4>
                <p>{creator.last_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p>{creator.email}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Phone Number</h4>
                <p>{creator.phone_number}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">KYC Status</h4>
                <p>{getKycStatus(creator.kyc_status)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">NIN Verification</h4>
                <p>{getKycStatus(creator.nin_verification_status)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">BVN Verification</h4>
                <p>{getKycStatus(creator.bvn_verification_status)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Verified</h4>
                <p>{creator.email_verified_at ? 'Yes' : 'No'}</p>
              </div>
              {creator.dob && (
                <div>
                  <h4 className="font-medium text-gray-900">Date of Birth</h4>
                  <p>{format(parseISO(creator.dob), 'MMM d, yyyy')}</p>
                </div>
              )}
              {creator.gender && (
                <div>
                  <h4 className="font-medium text-gray-900">Gender</h4>
                  <p className="capitalize">{creator.gender}</p>
                </div>
              )}
              {creator.marital_status && (
                <div>
                  <h4 className="font-medium text-gray-900">Marital Status</h4>
                  <p className="capitalize">{creator.marital_status}</p>
                </div>
              )}
              {creator.address && (
                <div className="col-span-2">
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <p>{creator.address}</p>
                </div>
              )}
              {creator.state && (
                <div>
                  <h4 className="font-medium text-gray-900">State</h4>
                  <p>{creator.state}</p>
                </div>
              )}
              {creator.nationality && (
                <div>
                  <h4 className="font-medium text-gray-900">Nationality</h4>
                  <p>{creator.nationality}</p>
                </div>
              )}
              {creator.occupation && (
                <div>
                  <h4 className="font-medium text-gray-900">Occupation</h4>
                  <p>{creator.occupation}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Created At</h4>
                <p>{format(parseISO(creator.created_at), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Updated At</h4>
                <p>{format(parseISO(creator.updated_at), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreatorDetailsModal;