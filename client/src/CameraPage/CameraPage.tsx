import Footer from '../Footer/Footer';
import Webcam from 'react-webcam';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CameraPage.css';
import PopUp from '../PopUp/PopUp';

const guideSteps = [
	{
		x: '50%',
		y: 300,
		title: 'Take a Photo!',
		message: 'This is where you can take a photo of the plant you want to identify.',
	},
	{
		x: '70%',
		y: 150,
		title: 'Use Your Photos!',
		message:
			"Open your photo library to view and manage the photos you've taken. You can use these photos to identify plants and add them to your collection!",
	},
	{
		x: '50%',
		y: 120,
		title: 'View Your Results!',
		message:
			'After taking a photo, you can view the results of the plant identification. This will show you information about the plant and help you learn more about it!',
	},
];

const videoConstraints = {
	width: 640,
	height: 480,
	facingMode: 'environment',
};

function CameraPage() {
	const webcamRef = useRef<Webcam | null>(null);
	const [image, setImage] = useState<string | null>(null);
	const navigate = useNavigate();

	const capture = useCallback(() => {
		if (webcamRef.current) {
			const screenshot = webcamRef.current.getScreenshot();
			setImage(screenshot);
		}
	}, []);

	const retake = () => setImage(null);

	const confirmPhoto = async () => {
		if (!image) return;

		// Convert data URL → Blob
		const imgResponse = await fetch(image);
		const blob = await imgResponse.blob();

		// Navigate to result page with the blob
		navigate('/camera/result', {
			state: { imageBlob: blob },
		});
	};

	return (
		<>
			<PopUp
				title="Welcome to the Forage Page!"
				message="Take a photo of the plant you want to identify!"
				steps={guideSteps}
			/>
			<section id="CameraPage">
				{image ?
					<div className="image-container">
						<img id="captured-image" src={image} alt="Captured" />
						<div className="image-options">
							<button onClick={retake} id="retake-photo">
								X
							</button>
							<button onClick={confirmPhoto} id="confirm-photo">
								Confirm Photo
							</button>
						</div>
					</div>
				:	<div className="video-container">
						<Webcam
							id="video"
							audio={false}
							ref={webcamRef}
							screenshotFormat="image/png"
							videoConstraints={videoConstraints}
						/>
						<button title="Take Photo" onClick={capture} id="take-photo" />
					</div>
				}
			</section>
			<Footer />
		</>
	);
}

export default CameraPage;
