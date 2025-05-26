import { Pagination, PageSize, PageJumper } from "./";

// Parent component that separates components based on their functionality.
// PageSize => Controls the page size.
// Pagination => Controls the pagination.
// PageJumper => Controls the page jumper.
export default function PageControl(props: {currentPage: number, totalPages: number, onPageChange: (page: number) => void, pageSize: number, setPageSize: (pageSize: number) => void}) {
  const { currentPage, totalPages, onPageChange, pageSize, setPageSize } = props;

  return (
    <div className="flex flex-col lg:flex-row w-full gap-5">
      <PageSize pageSize={pageSize} setPageSize={setPageSize} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <PageJumper currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
