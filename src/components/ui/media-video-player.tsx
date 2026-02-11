"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaVideoPlayerProps {
	videoSrc: string;
	className?: string;
	thumbnailClassName?: string;
}

export function MediaVideoPlayer({
	videoSrc,
	className,
	thumbnailClassName,
}: MediaVideoPlayerProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				aria-label="Videoyu oynat"
				className="group relative w-full cursor-pointer border-0 bg-transparent p-0"
				onClick={() => setIsOpen(true)}
			>
				<div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted/20 shadow-sm transition-all duration-200 ease-out group-hover:brightness-[0.9] group-hover:shadow-md">
					<video
						src={videoSrc}
						preload="metadata"
						muted
						playsInline
						className={cn(
							"aspect-video w-full max-h-64 object-contain",
							thumbnailClassName
						)}
					/>
					<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 transition-all duration-200 group-hover:bg-black/30">
						<div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg ring-2 ring-white/50 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
							<Play className="size-7 fill-brand text-brand" />
						</div>
					</div>
				</div>
			</button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
					<DialogTitle className="sr-only">Video oynatıcı</DialogTitle>
					<AnimatePresence>
						{isOpen && (
							<motion.div
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.95, opacity: 0 }}
								transition={{ type: "spring", damping: 25, stiffness: 300 }}
								className="overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl ring-2 ring-black/20"
							>
								<video
									src={videoSrc}
									controls
									autoPlay
									className="w-full"
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</DialogContent>
			</Dialog>
		</div>
	);
}
