import Link from 'next/link';

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  return (
    <div className="flex justify-center mt-6 items-center">
      {/* First page */}
      <Link
        href={`${baseUrl}?page=1`}
        className={`fa fa-angle-double-left px-2 py-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:text-orange-500'}`}
        aria-disabled={currentPage === 1}
      ></Link>

      {/* Previous page */}
      <Link
        href={`${baseUrl}?page=${currentPage - 1}`}
        className={`fa fa-angle-left px-2 py-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
        aria-disabled={currentPage === 1}
      ></Link>

      {/* Page numbers container */}
      <div className="flex mx-2 border border-gray-300">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={`px-3 py-1 ${
              page === currentPage ? 'font-bold text-black' : 'text-gray-600'
            }`}
          >
            [{page}]
          </Link>
        ))}
      </div>

      {/* Next page */}
      <Link
        href={`${baseUrl}?page=${currentPage + 1}`}
        className={`fa fa-angle-right px-2 py-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
        aria-disabled={currentPage === totalPages}
      ></Link>

      {/* Last page */}
      <Link
        href={`${baseUrl}?page=${totalPages}`}
        className={`fa fa-angle-double-right px-2 py-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
        aria-disabled={currentPage === totalPages}
      ></Link>
    </div>
  );
}
