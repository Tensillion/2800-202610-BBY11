import { CameraIcon, CollectionIcon, MapIcon, PetIcon, ProfileIcon } from '../components/Icons';
import NavItem from '../NavItem/NavItem';
import styles from './Footer.module.css';

/**
 * Footer component for the main elements for the application.
 * Uses navbar items to link to the main pages of the application.
 *
 * @returns footer with links to main pages.
 *
 * @author Umanga Bajgai
 * @author Tyson Nguyen
 */
function Footer() {
	return (
		<footer className={styles.footer}>
			<nav>
				<NavItem link="/map" label="map" icon={MapIcon} />

				<NavItem link="/collection" label="collection" icon={CollectionIcon} />

				<NavItem link="/pet" label="pet" icon={PetIcon} />

				<NavItem link="/camera" label="camera" icon={CameraIcon} />

				<NavItem link="/profile" label="profile" icon={ProfileIcon} />
			</nav>
		</footer>
	);
}

export default Footer;
