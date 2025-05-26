"use client"

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  itemsShown: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function TablePagination({
  currentPage,
  lastPage,
  total,
  itemsShown,
  onPageChange,
  isLoading
}: TablePaginationProps) {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = 1;
    let endPage = lastPage;
    
    if (lastPage > 5) {
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= lastPage - 2) {
        startPage = lastPage - 4;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => onPageChange(i)}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === i && "pointer-events-none"
          )}
          disabled={isLoading}
        >
          {i}
        </Button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
      <div className="text-muted-foreground">
        Showing <span className="font-medium">{itemsShown}</span> of{" "}
        <span className="font-medium">{total}</span> staff members
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          {renderPageNumbers()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}