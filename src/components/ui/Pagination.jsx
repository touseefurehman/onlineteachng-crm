import Button from './Button';

export const PAGE_SIZE = 8;

export function pageItems(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    totalPages,
  };
}

export default function Pagination({ totalItems, page, onPageChange, pageSize = PAGE_SIZE }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return (
    <div className="pagination-bar">
      <span>{totalItems} result{totalItems === 1 ? '' : 's'}</span>
      <div>
        <Button variant="ghost" size="sm" disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}>Previous</Button>
        <span className="pagination-status">Page {safePage} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)}>Next</Button>
      </div>
    </div>
  );
}
