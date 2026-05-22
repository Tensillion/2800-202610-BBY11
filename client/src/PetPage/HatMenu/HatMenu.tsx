import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { recolorImage } from "../../utils/recolorImage";
import "./HatMenu.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type HatItem = {
	_id?: string;
	type: string;
	hue: number;
	ownerId?: string;
};

type EquippedPet = {
	name: string;
	type: string;
	xp: number;
	level: number;
	happiness: number;
	food: number;
	hat?: {
		type: string;
		hue: number;
	} | null;
};

type HatMenuProps = {
	currentHat?: HatItem | null;
	onHatEquipped?: (pet: EquippedPet) => void;
};

type HatPreviewProps = {
	hat: HatItem;
};

function capitalize(label: string) {
	return label.slice(0, 1).toUpperCase() + label.slice(1);
}

function HatPreview({ hat }: HatPreviewProps) {
	const imgRef = useRef<HTMLImageElement>(null);
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);

	const applyPreview = useCallback(() => {
		const img = imgRef.current;
		if (!img) return;
		setPreviewSrc(recolorImage(img, hat.hue || 0));
	}, [hat.hue]);

	useEffect(() => {
		const img = imgRef.current;
		if (!img) {
			setPreviewSrc(null);
			return;
		}

		setPreviewSrc(null);

		if (img.complete) applyPreview();
		else img.addEventListener("load", applyPreview);

		return () => img.removeEventListener("load", applyPreview);
	}, [applyPreview, hat.type]);

	return (
		<div className="hat-menu__preview" aria-hidden="true">
			<img
				ref={imgRef}
				src={`/assets/hat_${hat.type}.png`}
				alt=""
				style={{ display: "none" }}
				crossOrigin="anonymous"
			/>
			{previewSrc ?
				<img src={previewSrc} alt="" />
			:	<div className="hat-menu__preview-skeleton" />}
		</div>
	);
}

export default function HatMenu({ currentHat, onHatEquipped }: HatMenuProps) {
	const { token } = useContext(AuthContext);
	const rootRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [hats, setHats] = useState<HatItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [equippingId, setEquippingId] = useState<string | null>(null);

	const getAuthHeaders = useCallback(
		() => ({
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		}),
		[token]
	);

	const currentHatKey = useMemo(() => {
		if (!currentHat) return null;
		return `${currentHat.type}:${currentHat.hue}`;
	}, [currentHat]);

	const loadHats = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BACKEND_URL}/petAPI/hat/getHats`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				throw new Error("Failed to load hats");
			}

			const data = await response.json();
			const ownedHats = Array.isArray(data?.hat) ? data.hat : [];
			setHats(ownedHats);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load hats");
		} finally {
			setLoading(false);
		}
	}, [getAuthHeaders]);

	useEffect(() => {
		if (!isOpen) return;

		const loadTimer = window.setTimeout(() => {
			void loadHats();
		}, 0);

		return () => window.clearTimeout(loadTimer);
	}, [isOpen, loadHats]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			const root = rootRef.current;
			if (root && !root.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	const handleEquipHat = useCallback(
		async (hat: HatItem) => {
			const hatKey = `${hat.type}:${hat.hue}`;
			const isCurrentlyEquipped = currentHatKey === hatKey;
			setEquippingId(hat._id ?? hatKey);
			setError(null);

			try {
				const response = await fetch(`${BACKEND_URL}/petAPI/setHat`, {
					method: "POST",
					headers: getAuthHeaders(),
					body: JSON.stringify({ hat: isCurrentlyEquipped ? null : hat }),
				});

				if (!response.ok) {
					let errorMessage = "Failed to equip hat";
					try {
						const errorData = await response.json();
						errorMessage = errorData.error || errorMessage;
					} catch {
						// Keep the generic message when the response is not JSON.
					}
					throw new Error(errorMessage);
				}

				const data = await response.json();
				const updatedPet = data?.pet as EquippedPet | undefined;
				if (updatedPet && onHatEquipped) {
					onHatEquipped(updatedPet);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to equip hat");
			} finally {
				setEquippingId(null);
			}
		},
		[getAuthHeaders, currentHatKey, onHatEquipped]
	);

	return (
		<div className="hat-menu" ref={rootRef}>
			<button
				type="button"
				className="hat-menu__toggle"
				aria-expanded={isOpen}
				onClick={() => setIsOpen(prev => !prev)}
			>
				<span aria-hidden="true">👒</span>
				<span>Hats</span>
				<span className="hat-menu__count">{hats.length}</span>
			</button>

			{isOpen && (
				<div className="hat-menu__overlay" role="presentation" onClick={() => setIsOpen(false)}>
					<div
						className="hat-menu__panel"
						role="dialog"
						aria-modal="true"
						aria-label="Hat selection menu"
						onClick={event => event.stopPropagation()}
					>
						<div className="hat-menu__header">
							<div>
								<h3 className="hat-menu__title">Hat Closet</h3>
								<p className="hat-menu__subtitle">
									Click a hat to equip it. Click the equipped hat again to unequip it.
								</p>
							</div>
							<button className="hat-menu__close" type="button" onClick={() => setIsOpen(false)}>
								Close
							</button>
						</div>

						<div className="hat-menu__content">
							{loading ?
								<p className="hat-menu__loading">Loading your hats...</p>
							: error ?
								<p className="hat-menu__error">{error}</p>
							: hats.length === 0 ?
								<p className="hat-menu__empty">
									No hats yet. Feed your pet to earn one every 5 levels.
								</p>
							:	<div className="hat-menu__items">
									{hats.map(hat => {
										const hatKey = `${hat.type}:${hat.hue}`;
										const isEquipped = currentHatKey === hatKey;
										const isEquipping = equippingId === (hat._id ?? hatKey);

										return (
											<button
												key={hatKey}
												type="button"
												className={`hat-menu__item ${isEquipped ? "hat-menu__item--active" : ""}`}
												onClick={() => void handleEquipHat(hat)}
												disabled={isEquipping}
											>
												<HatPreview hat={hat} />
												<div className="hat-menu__item-meta">
													<span className="hat-menu__item-name">{capitalize(hat.type)}</span>
													<span className="hat-menu__item-hue">Hue {hat.hue}°</span>
													{isEquipping ?
														<span className="hat-menu__item-badge">
															{isEquipped ? "Unequipping..." : "Equipping..."}
														</span>
													: isEquipped ?
														<span className="hat-menu__item-badge">Equipped</span>
													:	null}
												</div>
											</button>
										);
									})}
								</div>
							}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
