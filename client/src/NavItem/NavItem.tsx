import { Link } from "react-router-dom";

/**
 *Creates a navigation item for the navigation bar.
 *
 * @param props The data needed for an navigation item, including the link, label, and image.
 * @returns A navigation item that can be used in the navigation bar.
 *
 * @author Tyson Nguyen
 */
function NavItem(props: { link: string; label: string; image: string }) {
	return (
		<Link to={props.link}>
			<img src={props.image} alt={props.label} />
		</Link>
	);
}

export default NavItem;
