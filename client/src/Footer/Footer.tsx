import NavItem from "../NavItem/NavItem";
import styles from "./Footer.module.css";

function Footer() {
	return (
		<footer className={styles.footer}>
			<nav>
				<NavItem link="/map" label="map" image="/images/mapicon.png" />

				<NavItem
					link="/collection"
					label="collection"
					image="/images/collectionicon.png"
				/>

				<NavItem link="/pet" label="pet" image="/images/peticon.png" />

				<NavItem link="/camera" label="camera" image="/images/cameraicon.png" />

				<NavItem
					link="/profile"
					label="profile"
					image="/images/profileicon.png"
				/>
			</nav>
		</footer>
	);
}

export default Footer;
