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
		<div className="search-container">
			<div className="search-bar">
				<input
					className="search-input"
					type="search"
					name="search"
					value={value}
					placeholder="Enter Search"
					onChange={searchHandler}
					onKeyDown={handleKeyDown}
				></input>

				<button
					title="Search"
					type="button"
					className="search-button"
					onClick={() => onSearch(value)}
				>
					<img className="search-icon" src="/search-icon.svg" alt="Search"></img>
				</button>
			</div>
		</div>
	);
}

export default Search;
