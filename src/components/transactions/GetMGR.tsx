import React from 'react'
import { format } from 'date-fns';
import MGRdata from './MGRdata';

interface GetMGRProps {
  startDate: Date;
  endDate: Date;
}

const GetMGR: React.FC<GetMGRProps> = ({ startDate, endDate }) => {
  return (
    <div>
      <MGRdata />
      <div>
        <p>startDate, endDate </p>
      </div>
    </div>
  )
}

export default GetMGR;