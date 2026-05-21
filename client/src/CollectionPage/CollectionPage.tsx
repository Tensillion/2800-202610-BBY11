import PopUp from "../PopUp/PopUp";
import AskAIPopUp from "./AskAIPopUp/AskAIPopUp";
import "./CollectionPage.css";

const guideSteps = [
	{
		x: "50%",
		y: 300,
		title: "Look through the Catalogue !",
		message: "Search and filter through the plants to learn more about them.",
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
		<section id="collection-page">
			<PopUp
				title="Welcome to the Catalogue Page!"
				message="View all the plants you've identified and collected here."
				steps={guideSteps}
			/>

			<div>whatever collection page needs i guess</div>

			{/* Example usage of AskAIPopUp with demo plant info.
			Please put this into the actual plant item page where you can pass the DB plant info. */}
			<AskAIPopUp plantInfo={demoPlantInfo} />
		</section>
	);
}
export default CollectionPage;
