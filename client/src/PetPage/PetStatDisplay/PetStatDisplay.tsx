import "./PetStatDisplay.css";

export default function PetStatDisplay({
	name,
	xp,
	level,
	happiness,
}: {
	name: string;
	xp: number;
	level: number;
	happiness: number;
}) {
	return (
		<div className="PetStatDisplayContainer">
			<div className="content-container">
				<p>{name}</p>
				<div className="LevelXPContainer statbar">
					<div className="statbar-fill fillXP" style={{ width: `${xp}%` }}></div>
					<p className="level-display statbar-text">Level: {level} </p>
					<p className="xp-display statbar-text">{xp} / 100 </p>
				</div>

				<div className="HappinessContainer statbar">
					<div className="statbar-fill fillHappiness" style={{ width: `${happiness}%` }}>
						<p className="Happiness-display statbar-text">Happiness: {happiness}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
