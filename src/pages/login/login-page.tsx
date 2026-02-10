import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/ui/border-beam";
import { useLoginState } from "@/hooks/use-login-state";
import type { LoginRequest } from "@/types/auth.types";
import { toast } from "sonner";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login, isLoading, isLoggedIn } = useLoginState();
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoggedIn) {
			navigate("/");
		}
	}, [isLoggedIn, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const loginRequest: LoginRequest = { email, password };
			await login(loginRequest);
			navigate("/");
		} catch {
			toast.error("Invalid email or password. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const isFormDisabled = isLoading || isSubmitting;

	return (
		<div className="dark min-h-screen w-full bg-background">
			<div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
				{/* Logo & Brand */}
				<Link
					to="/"
					className="mb-8 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
				>
					<Building2 className="size-6" />
					<span className="text-sm font-medium">Acme Inc.</span>
				</Link>

				{/* Login Card with Border Beam */}
				<Card className="relative w-full max-w-[400px] overflow-hidden border-border/60 bg-card shadow-xl">
					<BorderBeam
						size={100}
						duration={8}
						colorFrom="hsl(var(--muted-foreground) / 0.4)"
						colorTo="hsl(var(--foreground) / 0.2)"
						borderWidth={1}
					/>
					<CardHeader className="space-y-2 pb-4">
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Welcome back
						</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="flex flex-col gap-4">
							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isFormDisabled}
									className="h-11 border-border/80 bg-background/50"
								/>
							</div>

							{/* Password */}
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										autoComplete="current-password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										disabled={isFormDisabled}
										className="h-11 border-border/80 bg-background/50 pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-11 px-3 text-muted-foreground hover:text-foreground"
										onClick={() => setShowPassword((p) => !p)}
										tabIndex={-1}
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</Button>
								</div>
							</div>
						</CardContent>
						<CardFooter className="pt-0">
							<Button
								type="submit"
								className="h-11 w-full font-medium"
								disabled={isFormDisabled}
								aria-busy={isFormDisabled}
							>
								{isFormDisabled ? "Signing in..." : "Login"}
							</Button>
						</CardFooter>
					</form>
				</Card>

				{/* Footer */}
				<p className="mt-8 max-w-[400px] text-center text-xs text-muted-foreground">
					By clicking continue, you agree to our{" "}
					<Link to="#" className="underline underline-offset-4 hover:text-foreground">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link to="#" className="underline underline-offset-4 hover:text-foreground">
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
