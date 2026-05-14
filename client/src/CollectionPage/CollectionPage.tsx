import Footer from '../Footer/Footer';
import PopUp from '../PopUp/PopUp';
import SearchComponent from './SearchComponent';
const guideSteps = [
	{
		x: '50%',
		y: 300,
		title: 'Look through your Collection!',
		message: "This is where you can view all the plants you've identified and collected.",
	},
	{
		x: '70%',
		y: 150,
		title: 'Unlocking New Plants',
		message:
			'Keep exploring and identifying new plants to add to your collection! The more you discover, the more you can show off here.',
	},
];

function CollectionPage() {
	return (
		<>
			<PopUp
				title="Welcome to the Collection Page!"
				message="View all the plants you've identified and collected here."
				steps={guideSteps}
			/>
			<div>
				<SearchComponent />
			</div>
			<Footer />
		</>
	);
}
export default CollectionPage;
