import Image from "next/image";

export function HeroBg() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			<Image
				src="/images/hero/hero-bg.jpg"
				alt=""
				fill
				priority
				sizes="100vw"
				className="object-cover object-center"
			/>
			{/* Overlay */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
		</div>
	);
}
