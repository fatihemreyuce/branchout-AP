import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface DarkModeToggleProps {
	className?: string;
	showIcons?: boolean;
	/** Button variant: full-width theme button for sidebar footer/header */
	variant?: "switch" | "button";
	/** Compact style for header (no full width) */
	compact?: boolean;
}

export default function DarkModeToggle({
	className,
	showIcons = true,
	variant = "switch",
	compact = false,
}: DarkModeToggleProps) {
	const [isDark, setIsDark] = useState(() => {
		const stored = localStorage.getItem("theme");
		return stored === "dark";
	});

	useEffect(() => {
		const legacyDark = localStorage.getItem("darkMode");
		const stored = localStorage.getItem("theme");
		let initialTheme = stored || "light";
		if (!stored && legacyDark) {
			try {
				const legacy = JSON.parse(legacyDark) as boolean;
				initialTheme = legacy ? "dark" : "light";
				localStorage.setItem("theme", initialTheme);
				localStorage.removeItem("darkMode");
			} catch {
				// ignore
			}
		}
		setIsDark(initialTheme === "dark");
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("dark");
		if (isDark) {
			root.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			localStorage.setItem("theme", "light");
		}
	}, [isDark]);

	if (variant === "button") {
		// Tek ikon: dark modda ay, light modda güneş (mevcut tema)
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsDark((prev) => !prev)}
				className={
					compact
						? `w-auto shrink-0 justify-center gap-2 rounded-lg border-border/80 font-medium px-3 ${className ?? ""}`
						: `w-full justify-start gap-3 rounded-lg border-border/80 font-medium ${className ?? ""}`
				}
				aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			>
				{isDark ? (
					<Moon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
				) : (
					<Sun className="size-4 shrink-0 text-muted-foreground" aria-hidden />
				)}
			</Button>
		);
	}

	return (
		<div className={className}>
			{showIcons && (
				<div className="flex items-center gap-2">
					<Sun className="size-4 text-muted-foreground shrink-0" aria-hidden />
					<Switch
						checked={isDark}
						onCheckedChange={setIsDark}
						aria-label="Toggle dark mode"
					/>
					<Moon className="size-4 text-muted-foreground shrink-0" aria-hidden />
				</div>
			)}
			{!showIcons && (
				<Switch
					checked={isDark}
					onCheckedChange={setIsDark}
					aria-label="Toggle dark mode"
				/>
			)}
		</div>
	);
}
