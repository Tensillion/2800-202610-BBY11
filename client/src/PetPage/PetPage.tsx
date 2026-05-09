import Footer from '../Footer/Footer';
import PopUp from '../PopUp/PopUp';

const guideSteps = [
	{
		x: '50%',
		y: 300,
		title: 'Feed Your Pet',
		message: 'This is where you use the food to feed your pet.',
	},
	{
		x: '70%',
		y: 150,
		title: 'Shop for Accessories',
		message:
			'Staying active and taking care of your pet will earn you credits that you can use to customize your pet!',
	},
	{
		x: '50%',
		y: 120,
		title: 'Keep Your Pet Healthy',
		message:
			'Make sure to feed your pet regularly and take care of it to keep it happy and healthy.',
	},
];

function PetPage() {
	return (
		<>
			<PopUp
				title="Welcome to the Pet Page!"
				message="Feed your pet and take care of it to keep it happy and healthy."
				steps={guideSteps}
			/>
			<div>whatever pet page needs i guess</div>
			<Footer />
		</>
	);
}
export default PetPage;
