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
	const storageKey = 'popup-dismissed?' + title;

	const [isOpen, setIsOpen] = useState(() => {
		if (typeof window === 'undefined') return true;
		return sessionStorage.getItem(storageKey) !== 'true';
	});

	const handleClose = () => {
		setIsOpen(false);
		sessionStorage.setItem(storageKey, 'true');
	};

	return (
		isOpen ?
			<div className="popup">
				<div className="popup-content">
					<h2 className="popup-title">{title}</h2>
					<p className="popup-message">{message}</p>

					<button className="popup-close" onClick={handleClose}>
						Close
					</button>
				</div>
			</div>
		: steps.length > 0 ? <GuidePopUp steps={steps} />
		: null
	);
}
