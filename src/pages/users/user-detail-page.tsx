import { Link, useParams, useNavigate } from "react-router-dom";
import {
	User,
	ArrowLeft,
	Pencil,
	Calendar,
	Mail,
	AtSign,
	Hash,
	CalendarClock,
} from "lucide-react";
import { useUserById } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("tr-TR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const userId = id ? Number(id) : NaN;
	const { data: user, isLoading, isError } = useUserById(userId);

	if (!id || Number.isNaN(userId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz kullanıcı ID.</p>
				<Button variant="outline" onClick={() => navigate("/users")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card className="overflow-hidden">
					<CardContent className="pt-6">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !user) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Kullanıcı bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/users")}>
					Listeye dön
				</Button>
			</div>
		);
	}

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
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 ring-2 ring-primary/20">
							<User className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{user.username}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Kullanıcı detayları
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0">
					<Link to={`/users/${user.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Bilgiler</CardTitle>
					<CardDescription>
						Kullanıcı kimlik ve tarih bilgileri
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{/* Kullanıcı adı */}
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
								<AtSign className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">
									Kullanıcı adı
								</p>
								<p className="font-semibold truncate">{user.username}</p>
							</div>
						</div>

						{/* E-posta */}
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
								<Mail className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">
									E-posta
								</p>
								<p className="font-semibold truncate">{user.email}</p>
							</div>
						</div>

						{/* ID */}
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/50 p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{user.id}</p>
							</div>
						</div>
					</div>

					{/* Tarihler */}
					<div className="mt-6 pt-6 border-t border-border/60">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
							<Calendar className="size-4" />
							Tarihler
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
								<CalendarClock className="size-5 text-muted-foreground shrink-0" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Oluşturulma
									</p>
									<p className="font-medium">{formatDate(user.createdAt)}</p>
								</div>
							</div>
							<div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
								<CalendarClock className="size-5 text-muted-foreground shrink-0" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Son güncelleme
									</p>
									<p className="font-medium">{formatDate(user.updatedAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
