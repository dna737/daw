import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageRange } from "../utils";

export default function Pagination(props: {currentPage: number, totalPages: number, onPageChange: (page: number) => void}) {

  const { currentPage, totalPages, onPageChange } = props;

  return (
    <PaginationComponent>
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 && (
            <PaginationPrevious 
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            />
          )}
        </PaginationItem>

       {getPageRange(currentPage, totalPages).map((page, idx) => (
          <PaginationItem key={idx}>
            {typeof page === "string" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          {currentPage < totalPages && (
            <PaginationNext 
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </PaginationComponent>
  )
}
