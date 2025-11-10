interface PaginateProps {
  pageCount: number;
  clickHandler: (page: number) => void;
  currentPage: number;
}

export default function Paginate({ pageCount, clickHandler, currentPage }: PaginateProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault();
    clickHandler(page);
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <ul className="pagination">
      <li className={`prev ${currentPage === 0 ? "disabled" : ""}`}>
        <a
          href="#"
          onClick={(e) => {
            if (currentPage > 0) {
              handleClick(e, currentPage - 1);
            }
          }}>
          Previous
        </a>
      </li>

      {pages.map((page) => (
        <li
          key={page}
          className={currentPage === page ? "active" : ""}
          onClick={() => clickHandler(page)}>
          <a href="#" onClick={(e) => handleClick(e, page)}>
            {page + 1}
          </a>
        </li>
      ))}

      <li className={`next ${currentPage >= pageCount - 1 ? "disabled" : ""}`}>
        <a
          href="#"
          onClick={(e) => {
            if (currentPage < pageCount - 1) {
              handleClick(e, currentPage + 1);
            }
          }}>
          Next
        </a>
      </li>
    </ul>
  );
}
