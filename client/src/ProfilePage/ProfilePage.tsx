import type { FormEvent } from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accessibility, ArrowLeft, ChevronRight, Leaf, Lock, Settings, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import styles from "./ProfilePage.module.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type ProfileView =
	| "account"
	| "accessibility"
	| "settings"
	| "accountSettings"
	| "editUsername"
	| "editPassword"
	| "locations";

interface PlantMarker {
	_id: string;
	lat: number;
	lng: number;
	plantName?: string;
	edible?: boolean | null;
	createdAt?: string;
}

/**
 * A profile page that shows the user's profile information.
 *
 * @returns a profile page react component.
 *
 * @author Arjun Brahmbhatt
 */
export default function ProfilePage() {
	const { login, logout, token, user } = useContext(AuthContext);
	const navigate = useNavigate();
	const [currentView, setCurrentView] = useState<ProfileView>("account");
	const [darkMode, setDarkMode] = useState(
		() => localStorage.getItem("profileDarkMode") === "true"
	);
	const [markers, setMarkers] = useState<PlantMarker[]>([]);
	const [markersLoading, setMarkersLoading] = useState(false);
	const [markersError, setMarkersError] = useState("");
	const [usernameInput, setUsernameInput] = useState(user?.username ?? "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formMessage, setFormMessage] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const displayName = user?.username ?? "User";

	useEffect(() => {
		localStorage.setItem("profileDarkMode", String(darkMode));
		document.documentElement.dataset.theme = darkMode ? "dark" : "light";
	}, [darkMode]);

	function handleLogout() {
		logout();
		navigate("/login");
	}

	function openAccountSettings() {
		setFormMessage("");
		setCurrentView("accountSettings");
	}

	function openEditUsername() {
		setUsernameInput(user?.username ?? "");
		setFormMessage("");
		setCurrentView("editUsername");
	}

	function openEditPassword() {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setFormMessage("");
		setCurrentView("editPassword");
	}

	async function openLocations() {
		setCurrentView("locations");
		setMarkersLoading(true);
		setMarkersError("");

		if (!token) {
			setMarkersLoading(false);
			setMarkersError("Please log in again to view your plant locations.");
			return;
		}

		try {
			const response = await fetch(`${BACKEND_URL}/markers/mine`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) {
				throw new Error("Unable to load plant locations.");
			}

			const markerData = (await response.json()) as PlantMarker[];
			setMarkers(markerData);
		} catch {
			setMarkersError("Could not load uploaded plant locations.");
		} finally {
			setMarkersLoading(false);
		}
	}

	async function handleUsernameSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!token) {
			setFormMessage("Please log in again.");
			return;
		}

		setIsSaving(true);
		setFormMessage("");

		try {
			const response = await fetch(`${BACKEND_URL}/users/profile/username`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username: usernameInput.trim() }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Could not update username.");
			}

			login(data.token);
			setFormMessage("Username updated.");
		} catch (error) {
			setFormMessage(error instanceof Error ? error.message : "Could not update username.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!token) {
			setFormMessage("Please log in again.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setFormMessage("New passwords do not match.");
			return;
		}

		setIsSaving(true);
		setFormMessage("");

		try {
			const response = await fetch(`${BACKEND_URL}/users/profile/password`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ currentPassword, newPassword }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Could not update password.");
			}

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setFormMessage("Password updated.");
		} catch (error) {
			setFormMessage(error instanceof Error ? error.message : "Could not update password.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<main className={styles.profilePage} data-theme={darkMode ? "dark" : "light"}>
			<section className={styles.profileContent} aria-label="Profile">
				<header className={styles.profileHeader}>
					<h1>Hi, {displayName}</h1>
				</header>

				{currentView === "accessibility" ?
					<section className={styles.panel} aria-label="Accessibility settings">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={() => setCurrentView("account")}
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
				: currentView === "locations" ?
					<section className={styles.panel} aria-label="Uploaded plant locations">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={() => setCurrentView("account")}
							aria-label="Back to account"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Uploaded Plant Locations</span>
						</button>

						<div className={styles.locationList}>
							{markersLoading ?
								<p className={styles.statusText}>Loading locations...</p>
							: markersError ?
								<p className={styles.statusText}>{markersError}</p>
							: markers.length === 0 ?
								<p className={styles.statusText}>No uploaded plant locations yet.</p>
							:	markers.map(marker => (
									<article className={styles.locationCard} key={marker._id}>
										<strong>{marker.plantName || "Unnamed plant"}</strong>
										<span>
											Lat: {marker.lat.toFixed(4)} | Lng: {marker.lng.toFixed(4)}
										</span>
									</article>
								))
							}
						</div>
					</section>
				: currentView === "settings" ?
					<section className={styles.panel} aria-label="Settings">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={() => setCurrentView("account")}
							aria-label="Back to account"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Settings</span>
						</button>

						<button className={styles.menuRow} type="button" onClick={openAccountSettings}>
							<User size={22} strokeWidth={2} />
							<span>Account</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>
					</section>
				: currentView === "accountSettings" ?
					<section className={styles.panel} aria-label="Account settings">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={() => setCurrentView("settings")}
							aria-label="Back to settings"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Account</span>
						</button>

						<button className={styles.menuRow} type="button" onClick={openEditUsername}>
							<User size={22} strokeWidth={2} />
							<span>Edit Username</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>

						<button className={styles.menuRow} type="button" onClick={openEditPassword}>
							<Lock size={22} strokeWidth={2} />
							<span>Edit Password</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>
					</section>
				: currentView === "editUsername" ?
					<section className={styles.panel} aria-label="Edit username">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={openAccountSettings}
							aria-label="Back to account"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Edit Username</span>
						</button>

						<form className={styles.profileForm} onSubmit={handleUsernameSubmit}>
							<label htmlFor="profile-username">Username</label>
							<input
								id="profile-username"
								type="text"
								value={usernameInput}
								onChange={event => setUsernameInput(event.target.value)}
								minLength={3}
								maxLength={30}
								pattern="^[a-zA-Z0-9_]+$"
								required
							/>
							<button type="submit" disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Username"}
							</button>
							{formMessage && <p className={styles.formMessage}>{formMessage}</p>}
						</form>
					</section>
				: currentView === "editPassword" ?
					<section className={styles.panel} aria-label="Edit password">
						<button
							className={styles.panelTitle}
							type="button"
							onClick={openAccountSettings}
							aria-label="Back to account"
						>
							<ArrowLeft size={20} strokeWidth={2} />
							<span>Edit Password</span>
						</button>

						<form className={styles.profileForm} onSubmit={handlePasswordSubmit}>
							<label htmlFor="profile-current-password">Current Password</label>
							<input
								id="profile-current-password"
								type="password"
								value={currentPassword}
								onChange={event => setCurrentPassword(event.target.value)}
								minLength={6}
								required
							/>
							<label htmlFor="profile-new-password">New Password</label>
							<input
								id="profile-new-password"
								type="password"
								value={newPassword}
								onChange={event => setNewPassword(event.target.value)}
								minLength={6}
								required
							/>
							<label htmlFor="profile-confirm-password">Confirm New Password</label>
							<input
								id="profile-confirm-password"
								type="password"
								value={confirmPassword}
								onChange={event => setConfirmPassword(event.target.value)}
								minLength={6}
								required
							/>
							<button type="submit" disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Password"}
							</button>
							{formMessage && <p className={styles.formMessage}>{formMessage}</p>}
						</form>
					</section>
				:	<section className={styles.panel} aria-label="Account menu">
						<button className={styles.menuRow} type="button" onClick={openLocations}>
							<Leaf size={22} strokeWidth={2} />
							<span>Uploaded Plant Locations</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>

						<button
							className={styles.menuRow}
							type="button"
							onClick={() => setCurrentView("accessibility")}
						>
							<Accessibility size={22} strokeWidth={2} />
							<span>Accessibility</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>

						<button
							className={styles.menuRow}
							type="button"
							onClick={() => setCurrentView("settings")}
						>
							<Settings size={22} strokeWidth={2} />
							<span>Settings</span>
							<ChevronRight size={20} strokeWidth={2} />
						</button>
					</section>
				}

				<div className={styles.actions}>
					<button type="button" onClick={handleLogout}>
						Sign out
					</button>
				</div>
			</section>
		</main>
	);
}
