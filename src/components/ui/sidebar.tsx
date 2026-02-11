import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BorderBeam } from "@/components/ui/border-beam";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { useLoginState } from "@/hooks/use-login-state";
import {
	LayoutDashboard,
	LogOut,
	Sparkles,
	ChevronRight,
	Users,
	Building2,
	Languages,
	Leaf,
	Handshake,
	UserRound,
	ImageIcon,
	Layout,
	Puzzle,
	FileType,
} from "lucide-react";

interface NavItem {
	to: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	end?: boolean;
}

const navigationItems: NavItem[] = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard,
		end: true,
	},
	{
		to: "/users",
		label: "Kullanıcılar",
		icon: Users,
		end: false,
	},
	{
		to: "/offices",
		label: "Ofisler",
		icon: Building2,
		end: false,
	},
	{
		to: "/languages",
		label: "Diller",
		icon: Languages,
		end: false,
	},
	{
		to: "/eco-partners",
		label: "Eco Partner'lar",
		icon: Leaf,
		end: false,
	},
	{
		to: "/partners",
		label: "Partner'lar",
		icon: Handshake,
		end: false,
	},
	{
		to: "/team-members",
		label: "Ekip Üyeleri",
		icon: UserRound,
		end: false,
	},
	{
		to: "/assets",
		label: "Medyalar",
		icon: ImageIcon,
		end: false,
	},
	{
		to: "/components",
		label: "Bileşenler",
		icon: Puzzle,
		end: false,
	},
	{
		to: "/component-types",
		label: "Bileşen Tipleri",
		icon: Layout,
		end: false,
	},
	{
		to: "/page-types",
		label: "Sayfa Tipleri",
		icon: FileType,
		end: false,
	},
];

export default function Sidebar() {
	const { logout, isActionable, isLoading } = useLoginState();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch {
			// noop
		}
	};

	return (
		<aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/60 bg-card/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
			{/* Header with subtle accent */}
			<div className="relative flex h-16 shrink-0 items-center justify-between gap-3 px-5 border-b border-border/60">
				<BorderBeam
					size={40}
					duration={12}
					colorFrom="hsl(var(--muted-foreground) / 0.3)"
					colorTo="hsl(var(--foreground) / 0.15)"
					borderWidth={1}
					className="opacity-80"
				/>
				<NavLink
					to="/"
					className="flex items-center gap-2.5 text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md min-w-0"
				>
					<div className="flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
						<Sparkles className="size-4" />
					</div>
					<span className="text-base font-semibold tracking-tight truncate">
						Branchout
					</span>
				</NavLink>
				<DarkModeToggle variant="button" compact />
			</div>

			{/* Navigation */}
			<nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
				{navigationItems.map((item) => {
					const Icon = item.icon;
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={({ isActive }) =>
								`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
									isActive
										? "bg-brand text-brand-foreground shadow-sm"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
								}`
							}
						>
							<Icon className="size-4 shrink-0" />
							<span className="flex-1 truncate">{item.label}</span>
							<ChevronRight
								className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
								aria-hidden
							/>
						</NavLink>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="shrink-0 border-t border-border/60 p-3 space-y-3">
				<Separator className="sr-only" />
				{/* Logout */}
				<Button
					variant="outline"
					size="sm"
					onClick={handleLogout}
					disabled={!isActionable || isLoading}
					className="w-full justify-start gap-3 rounded-lg border-border/80 font-medium"
					aria-busy={isLoading}
				>
					<LogOut className="size-4 shrink-0" />
					{isLoading ? "Logging out..." : "Logout"}
				</Button>
			</div>
		</aside>
	);
}
