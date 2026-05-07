import NavItem from '../NavItem/NavItem';
import styles from './Footer.module.css';
import { ProfileIcon, CameraIcon, PetIcon, CollectionIcon, MapIcon } from '../components/Icons';

function Footer() {
	return (
		<footer className={styles.footer}>
			<nav>
				<NavItem link="/map" label="Map" icon={MapIcon} />

				<NavItem link="/collection" label="Collection" icon={CollectionIcon} />

				<NavItem link="/pet" label="Pet" icon={PetIcon} />

				<NavItem link="/camera" label="Forage" icon={CameraIcon} />

				<NavItem link="/profile" label="Profile" icon={ProfileIcon} />
			</nav>
		</footer>
	);
}

export default Footer;
