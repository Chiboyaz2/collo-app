import React from 'react';
import MGRdata from './MGRdata';
import MGRTable from './MGRTable';

interface GetMGRProps {
  startDate: Date;
  endDate: Date;
}

const GetMGR: React.FC<GetMGRProps> = ({ startDate, endDate }) => {
  return (
    <div>
      <MGRdata />
      <div>
        <MGRTable startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
};

export default GetMGR;