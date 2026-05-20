import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accessibility, ArrowLeft, ChevronRight, Leaf, Settings } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import styles from "./ProfilePage.module.css";

/**
 * A profile page that shows the user's profile information.
 *
 * @returns a profile page react component.
 *
 * @author Arjun Brahmbhatt
 */
export default function ProfilePage() {
	const { logout, user } = useContext(AuthContext);
	const navigate = useNavigate();
	const [showAccessibility, setShowAccessibility] = useState(false);
	const [darkMode, setDarkMode] = useState(
		() => localStorage.getItem("profileDarkMode") === "true"
	);
	const displayName = user?.username ?? "User";

	useEffect(() => {
		localStorage.setItem("profileDarkMode", String(darkMode));
	}, [darkMode]);

	function handleLogout() {
		logout();
		navigate("/login");
	}

	return (
		<main className={styles.profilePage} data-theme={darkMode ? "dark" : "light"}>
			<section className={styles.profileContent} aria-label="Profile">
				<header className={styles.profileHeader}>
					<h1>Hi, {displayName}</h1>
				</header>

				{showAccessibility ?
					<section className={styles.panel} aria-label="Accessibility settings">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={() => setShowAccessibility(false)}
							aria-label="Back to account"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Accessibility Settings</span>
						</button>

						<div className={styles.settingRow}>
							<span>Dark Mode</span>
							<button
								className={styles.toggle}
								type="button"
								role="switch"
								aria-checked={darkMode}
								aria-label="Dark mode"
								onClick={() => setDarkMode(current => !current)}
							>
								<span />
							</button>
						</div>
					</section>
				:	<section className={styles.panel} aria-label="Account menu">
						<button className={styles.menuRow} type="button">
							<Leaf size={22} strokeWidth={2} />
							<span>Uploaded Plant Locations</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>

						<button
							className={styles.menuRow}
							type="button"
							onClick={() => setShowAccessibility(true)}
						>
							<Accessibility size={22} strokeWidth={2} />
							<span>Accessibility</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>

						<button className={styles.menuRow} type="button">
							<Settings size={22} strokeWidth={2} />
							<span>Settings</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>
					</section>
				}

				<div className={styles.actions}>
					<button type="button">Edit Profile</button>
					<button type="button" onClick={handleLogout}>
						Sign out
					</button>
				</div>
			</section>
		</main>
	);
}
