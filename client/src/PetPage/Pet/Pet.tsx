import { useState, type ReactNode } from "react";
import "./Pet.css";
import { HeartExplosion } from "./HeartExplosion";
import msgs from "../../../public/assets/pet-msgs/pet-msgs.json";

type PetProps = {
	imageUrl: string;
	overlay?: ReactNode;
};

export default function Pet({ imageUrl, overlay }: PetProps) {
	const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);
	const [cooldown, setCooldown] = useState(false);
	const [nextId, setNextId] = useState(0);
	const [count, setCount] = useState(0);
	const [msg, setMsg] = useState("");
	const [msgOn, setMsgOn] = useState(false);
	const [jumping, setJumping] = useState(false);
	const [msgCount, setMsgCount] = useState(Math.floor(Math.random() * 14));


	function clickEffect(e: React.MouseEvent<HTMLImageElement>) {
		if (cooldown) return;

		setCooldown(true);
		setTimeout(() => setCooldown(false), 500);

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const id = nextId;
		setNextId(id + 1);
		if(msg === "")
		{
			setCount(count +1);
		}
		if(count % 2 == 0)
		{
			setMsg(msgs[msgCount]);
			setMsgCount(Math.floor(Math.random() * 14));
		
			setMsgOn(true);

			setTimeout(() => {
      			setMsg("");
    		}, 2000);
			setTimeout(() => {
				setMsgOn(false);
    		}, 1600);
		}


		setExplosions(prev => [...prev, { id, x, y }]);

		setJumping(true);

		// reset jump after animation
    	setTimeout(() => {
      		setJumping(false);
    	}, 500);

		// remove after animation
		setTimeout(() => {
			setExplosions(prev => prev.filter(ex => ex.id !== id));
		}, 1500);

	}

	return (
		<div className="pet-figure">
			{overlay}
			<div className={msgOn? "msgAppear" : "msgDisappear"}>{msg}
				<div className="msgTail">
				
				</div>
			</div>
			<div className={jumping? "jump" : ""}> {/*This div is soley to perform the jump animation*/}
				<img src={imageUrl} id="pet-image" onClick={clickEffect} alt="Pet" />
			</div>
			
			{explosions.map(ex => (
				<HeartExplosion key={ex.id} x={ex.x} y={ex.y} />
			))}
		</div>
	);
}
