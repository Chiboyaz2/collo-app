
export interface Transaction {
  id: number;
  user_id: number;
  virtual_account_id: number;
  transaction_id: string;
  session_id: string;
  type: string;
  reference: string;
  amount: string;
  processing_fee: number;
  total_amount: string;
  flow: string;
  remark: string;
  description: string;
  source: string;
  source_id: string;
  destination: string;
  destination_id: string;
  provider: string;
  provider_status: string;
  created_at: string;
  updated_at: string;
  currency: string;
  balance_before: string;
  balance_after: string;
  exchange_rate: string;
}

export interface ApiResponse {
  status: string;
  message: {
    current_page: number;
    data: Transaction[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  data: string;
}

export interface GetTransactionsProps {
  startDate: Date;
  endDate: Date;
}

export interface TransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}