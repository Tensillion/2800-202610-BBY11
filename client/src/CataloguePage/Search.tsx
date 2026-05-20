import "./Search.css";
import React, { useState, type ChangeEvent } from "react";

export type SearchProps = {
  onSearch: (value: string) => void;
};

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
    <div className="bg-white h-10 px-5 pr-10 w-full rounded-full text-sm focus:outline-none">
      <input
        className="bg-white h-10 px-5 pr-10 w-full rounded-full text-sm focus:outline-none"
        type="search"
        name="search"
        value={value}
        placeholder="Enter Search"
        onChange={searchHandler}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className="right-0 top-0 mt-3 mr-4"
        onClick={() => onSearch(value)}
      >
        <img className="h-4 w-4" src="/search-icon.svg"></img>
      </button>
    </div>
  );
}

export default Search;
