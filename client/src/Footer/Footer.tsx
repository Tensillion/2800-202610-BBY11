import NavItem from "../NavItem/NavItem";
import styles from "./Footer.module.css";
import { MapPin } from "lucide-react";
/**
 * Footer component for the main elements for the application.
 * Uses navbar items to
 * @returns footer with links to main pages.
 *
 * @author Umanga Bajgai
 */
function Footer() {
  return (
    <footer className={styles.footer}>
      <nav>
        <NavItem link="/map" label="map" icon={MapPin} />

        <NavItem
          link="/collection"
          label="collection"
          icon={MapPin}
        />

        <NavItem link="/pet" label="pet" icon={MapPin} />

        <NavItem link="/camera" label="camera" icon={MapPin} />

        <NavItem
          link="/profile"
          label="profile"
          icon={MapPin}
        />
      </nav>
    </footer>
  );
}

export default Footer;
