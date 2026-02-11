import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, AtSign, Mail, Lock, Loader2 } from "lucide-react";
import { useCreateUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function UserCreatePage() {
	const navigate = useNavigate();
	const createUser = useCreateUser();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createUser.mutate(
			{ username, email, password },
			{
				onSuccess: () => navigate("/users"),
			}
		);
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/users">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<UserPlus className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Yeni Kullanıcı
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Yeni bir kullanıcı hesabı oluşturun
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Kullanıcı bilgileri</CardTitle>
					<CardDescription>
						Aşağıdaki alanları doldurarak yeni kullanıcıyı ekleyin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{/* Kullanıcı adı */}
							<div className="space-y-2">
								<Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
									<AtSign className="size-4 text-muted-foreground" />
									Kullanıcı adı
								</Label>
								<div className="relative">
									<AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										placeholder="johndoe"
										required
										autoComplete="username"
										className="pl-9"
									/>
								</div>
							</div>

							{/* E-posta */}
							<div className="space-y-2">
								<Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
									<Mail className="size-4 text-muted-foreground" />
									E-posta
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="ornek@email.com"
										required
										autoComplete="email"
										className="pl-9"
									/>
								</div>
							</div>

							{/* Şifre */}
							<div className="space-y-2">
								<Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
									<Lock className="size-4 text-muted-foreground" />
									Şifre
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
										minLength={6}
										autoComplete="new-password"
										className="pl-9"
									/>
								</div>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button type="submit" disabled={createUser.isPending} className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
								{createUser.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<UserPlus className="size-4" />
								)}
								{createUser.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/users">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
