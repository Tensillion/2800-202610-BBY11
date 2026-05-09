import { useState } from 'react';
import './PopUp.css';
import GuidePopUp from './GuidePopUp/GuidePopUp';

type Step = {
	x: string | number; // using string to allow for percentage values like "50%"
	y: string | number;
	title: string;
	message: string;
};

type PopUpProps = {
	title: string;
	message: string;
	steps?: Step[]; // optional steps for the guide pop-up
};

/**
 * Shows a pop-up with a title and a message. The pop-up can be closed by clicking the "Close" button.
 * It stores a boolean value in sessionStorage to remember if the pop-up has been closed,
 * so it won't show again during the same session.
 *
 * @author Tyson Nguyen
 */
export default function PopUp({
	title,
	message,
	steps = [], // default value ensures safe usage
}: PopUpProps) {
	const storageKey = 'popup-dismissed?' + title + message.substring(0, 10); // unique key for this pop-up based on title and message

	const [wantTutorial, setWantTutorial] = useState(true);

	const [isOpen, setIsOpen] = useState(() => {
		if (typeof window === 'undefined') return true;
		return sessionStorage.getItem(storageKey) !== 'true';
	});

	const handleClose = () => {
		setIsOpen(false);
		sessionStorage.setItem(storageKey, 'true');
	};

	const handleCloseNoTutorial = () => {
		setIsOpen(false);
		sessionStorage.setItem(storageKey, 'true');
		sessionStorage.setItem(
			'popup-dismissed?' + steps[0]?.title + steps[0]?.message.substring(0, 10),
			'true'
		);
		setWantTutorial(false);
	};

	return (
		isOpen ?
			<div className="popup">
				<div className="popup-content">
					<h2 className="popup-title">{title}</h2>
					<p className="popup-message">{message}</p>

					<button className="popup-close" onClick={handleClose}>
						Get Started
					</button>
					<button className="popup-close-skip" onClick={handleCloseNoTutorial}>
						Skip Tutorial
					</button>
				</div>
			</div>
		: wantTutorial && steps.length > 0 ? <GuidePopUp steps={steps} />
		: null
	);
}
