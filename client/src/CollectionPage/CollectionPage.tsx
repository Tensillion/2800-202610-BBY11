import Footer from "../Footer/Footer";
import PopUp from "../PopUp/PopUp";
import AskAIPopUp from "./AskAIPopUp/AskAIPopUp";

import Footer from '../Footer/Footer';
import PopUp from '../PopUp/PopUp';
import SearchComponent from './SearchComponent';
const guideSteps = [
	{
		x: "50%",
		y: 300,
		title: "Look through your Collection!",
		message: "This is where you can view all the plants you've identified and collected.",
	},
	{
		x: "70%",
		y: 150,
		title: "Unlocking New Plants",
		message:
			"Keep exploring and identifying new plants to add to your collection! The more you discover, the more you can show off here.",
	},
];

function CollectionPage() {
	const demoPlantInfo = {
		name: "Rubus spectabilis",
		edible: true,
		parts: ["berries", "young shoots"],
		warnings:
			"Young shoots best harvested before leaves fully unfurl. Berries tart but palatable raw or cooked.",
		sources: ["https://www.wikidata.org/wiki/Q159021", "https://www.gbif.org/species/3003011"],
	};

	return (
		<>
			<PopUp
				title="Welcome to the Collection Page!"
				message="View all the plants you've identified and collected here."
				steps={guideSteps}
			/>

			<div>whatever collection page needs i guess</div>

			{/* Example usage of AskAIPopUp with demo plant info.
			Please put this into the actual plant item page where you can pass the DB plant info. */}
			<AskAIPopUp plantInfo={demoPlantInfo} />
			<div>
				<SearchComponent />
			</div>
			<Footer />
		</>
	);
}
export default CollectionPage;
