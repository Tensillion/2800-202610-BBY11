import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const SLIDES = [
	{
		bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
		label: 'Forage for wild edibles in Vancouver',
	},
	{
		bg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
		label: "Scan plants with our plant identifier to find out if they're edible",
	},
	{
		bg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
		label: 'Feed your pet with your finds and watch them grow',
	},
	{
		bg: 'https://s1.zerochan.net/Seele.%28Honkai.Star.Rail%29.600.3949005.jpg',
		label: 'Share your finds with the community',
	},
];

const DURATION = 4500;

/**
 * Creates a landing page with a carousel of images and a title.
 * Generated with the help of Claude Sonnet 4.6, edited + annotated by Tyson Nguyen.
 *
 * @returns Landing Page
 *
 * @authors https://claude.ai/chat, Tyson Nguyen
 */
export default function LandingPage() {
	//Current slide index,
	const [current, setCurrent] = useState(0);
	// and whether we're in the middle of a fade animation
	const [fading, setFading] = useState(false);

	//useRefs values persist across renders without causing re-renders, perfect for timers and drag state

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const dragStartX = useRef<number | null>(null);
	const dragDelta = useRef(0);

	//Go to slide idx, with fade animation
	const goTo = useCallback((idx: number) => {
		setFading(true);
		setTimeout(() => {
			setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
			setFading(false);
		}, 400);
	}, []);

	//Saved functions for next and prev to use in timers and handlers without worrying about stale closures
	const next = useCallback(() => goTo(current + 1), [current, goTo]);
	const prev = useCallback(() => goTo(current - 1), [current, goTo]);

	//Automatic slide every DURATION ms, reset on manual navigation
	const resetTimer = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(next, DURATION);
	}, [next]);

	//Reset timer on slide change, and clear on unmount
	useEffect(() => {
		resetTimer();
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [resetTimer]);

	//Mouse handling, just grabs and checks the delta of x movement

	const onPointerDown = (x: number) => {
		dragStartX.current = x;
		dragDelta.current = 0;
		if (timerRef.current) clearTimeout(timerRef.current);
	};

	const onPointerMove = (x: number) => {
		if (dragStartX.current === null) return;
		dragDelta.current = x - dragStartX.current;
	};

	const onPointerUp = () => {
		if (dragStartX.current === null) return;
		if (dragDelta.current < -50) next();
		else if (dragDelta.current > 50) prev();
		else resetTimer();
		dragStartX.current = null;
	};

	return (
		<div className="lp-root">
			{/* Title Goes here, Replace with Logo IMG afterwards*/}
			<header className="lp-header">
				<h1 className="lp-title">
					Forage
					<br />
					Friends
				</h1>
			</header>

			{/* Image Carousel */}
			<div
				className="lp-carousel"
				onMouseDown={e => onPointerDown(e.clientX)}
				onMouseMove={e => onPointerMove(e.clientX)}
				onMouseUp={onPointerUp}
				onMouseLeave={onPointerUp}
				onTouchStart={e => onPointerDown(e.touches[0].clientX)}
				onTouchMove={e => onPointerMove(e.touches[0].clientX)}
				onTouchEnd={onPointerUp}
			>
				{SLIDES.map((slide, i) => (
					<div
						key={i}
						className={`lp-slide ${
							i === current ?
								fading ? 'lp-slide--fading'
								:	'lp-slide--active'
							:	''
						}`}
						style={{ backgroundImage: `url(${slide.bg})` }}
					/>
				))}

				{/* Slide label overlaid at bottom of image */}
				<p className={`lp-slide-label ${fading ? 'lp-slide-label--fading' : ''}`}>
					{SLIDES[current].label}
				</p>
			</div>

			{/*Footer – dots + button on plain bg */}
			<footer className="lp-footer">
				<div className="lp-dots">
					{SLIDES.map((_, i) => (
						<button
							key={i}
							className={`lp-dot ${i === current ? 'lp-dot--active' : ''}`}
							onClick={() => goTo(i)}
							aria-label={`Go to slide ${i + 1}`}
						/>
					))}
				</div>

				{/* Continue button, leads to signup page*/}
				<Link to="/signup" className="lp-continue-link">
					<button className="lp-continue">Get Started!</button>
				</Link>
			</footer>
		</div>
	);
}
