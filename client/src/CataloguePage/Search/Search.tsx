import "./Search.css";
import React, { useState, type ChangeEvent } from "react";

export type SearchProps = {
  onSearch: (value: string) => void;
};

/**
 * This is the search bar element, which renders the serach bar,
 * and uses event handlers to provide the functionality.
 * 
 * @param prop is a search string.
 * @returns Search Bar component.
 * 
 * @author Umanga Bajgai
 */
function Search(props: SearchProps) {
  const { onSearch } = props;
  const [value, setValue] = useState("");

  const searchHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(value);
      console.log(value);
    }
  };

  return (
    <div className="searchBar">
      <input
        className="searchInput"
        type="search"
        name="search"
        value={value}
        placeholder="Enter Search"
        onChange={searchHandler}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className="searchButton"
        onClick={() => onSearch(value)}
      >
        <img className="searchIcon" src="/search-icon.svg"></img>
      </button>
    </div>
  );
}

export default Search;
