interface PaginationItemProps {
  page: number;
  currentPage: number;
  clickHandler: (page: number) => void;
}

export default function PaginationItem({ page, currentPage, clickHandler }: PaginationItemProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    clickHandler(page);
  }
  return (
    <li
      key={page}
      className={currentPage === page ? "active" : ""}
      onClick={() => clickHandler(page)}>
      <a href="#" onClick={handleClick}>
        {page + 1}
      </a>
    </li>
  );
}
