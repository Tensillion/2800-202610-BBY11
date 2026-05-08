import Footer from '../Footer/Footer';
import Webcam from 'react-webcam';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CameraPage.css';
import PopUp from '../PopUp/PopUp';

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
