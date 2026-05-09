import Footer from '../Footer/Footer';
import PopUp from '../PopUp/PopUp';

const guideSteps = [
	{
		x: '50%',
		y: 300,
		title: 'Scan Your Area!',
		message: 'This is where you can explore the map and find plants in your area.',
	},
	{
		x: '70%',
		y: 150,
		title: 'Sort for Plants!',
		message:
			'Use the filters to sort for different types of plants and find the ones you are interested in!',
	},
	{
		x: '50%',
		y: 120,
		title: 'Share your finds!',
		message:
			'Share your plant discoveries with the community and help others find great forage locations!',
	},
];

function MapPage() {
	return (
		<>
			<PopUp
				title="Welcome to the Map Page!"
				message="Explore the map to find plants in your area."
				steps={guideSteps}
			/>
			<div>whatever map page needs i guess</div>
			<Footer />
		</>
	);
}
export default MapPage;
