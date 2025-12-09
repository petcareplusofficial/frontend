import "./Searchbar.css";

function SearchBar({ placeholder = "Search anything..." }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
      />
      <button className="search-btn">
        {/* unicode or SVG search icon, can swap with img if needed */}
        <span role="img" aria-label="search">&#128269;</span>
      </button>
    </div>
  );
}

export default SearchBar;
