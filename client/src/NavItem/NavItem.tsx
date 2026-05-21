import { Link, useLocation } from 'react-router-dom';
import './NavItem.css';

/**
 *Creates a navigation item for the navigation bar.
 *
 * @param props The data needed for an navigation item, including the link, label, icon component, and optional icon color.
 * @returns A navigation item that can be used in the navigation bar.
 *
 * @author Tyson Nguyen
 * @version 1.2
 */
function NavItem(props: {
	link: string;
	label: string;
	icon: React.ComponentType<{ color?: string }>;
}) {
	const IconComponent = props.icon;
	const location = useLocation();
	const isActive =
		location.pathname === props.link || location.pathname.startsWith(`${props.link}/`);
	const resolvedColor = isActive ? "var(--nav-active)" : "var(--nav-inactive)";

	return (
		<div className="nav-item-container">
			<Link className="nav-item-link" to={props.link}>
				<div className="nav-item">
					<div className="nav-item-image">
						<IconComponent color={resolvedColor} />
					</div>
					<p className={`nav-item-label ${isActive ? 'active' : 'inactive'}`}>{props.label}</p>
				</div>
			</Link>
		</div>
	);
}

export default NavItem;
