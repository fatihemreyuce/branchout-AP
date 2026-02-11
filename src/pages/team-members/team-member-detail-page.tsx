import { Link, useParams, useNavigate } from "react-router-dom";
import {
	Users,
	ArrowLeft,
	Pencil,
	Mail,
	Linkedin,
	UserCircle,
	Globe,
	Hash,
} from "lucide-react";
import { useTeamMemberById } from "@/hooks/use-team-members";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamMemberResponse } from "@/types/team.members.types";

type LocalizationItem = TeamMemberResponse["localizations"][number];

function getPhotoUrl(photo: string): string {
	if (!photo) return "";
	if (photo.startsWith("http") || photo.startsWith("//")) return photo;
	return photo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${photo}` : photo;
}

export default function TeamMemberDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const memberId = id ? Number(id) : NaN;
	const { data: member, isLoading, isError } = useTeamMemberById(memberId);

	if (!id || Number.isNaN(memberId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz ekip üyesi ID.</p>
				<Button variant="outline" onClick={() => navigate("/team-members")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="h-24 bg-muted animate-pulse rounded-lg" />
							<div className="h-24 bg-muted animate-pulse rounded-lg" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !member) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Ekip üyesi bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/team-members")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/team-members">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<Avatar className="size-14 ring-2 ring-brand-ring shrink-0">
							<AvatarImage src={getPhotoUrl(member.photo)} alt={member.name} />
							<AvatarFallback className="bg-brand-muted text-brand text-lg font-semibold">
								{member.name.slice(0, 2).toUpperCase() || "?"}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{member.name || "İsimsiz"}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Ekip üyesi detayları
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/team-members/${member.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Genel bilgiler</CardTitle>
						<CardDescription>İletişim ve sosyal medya</CardDescription>
					</CardHeader>
					<CardContent className="p-6 space-y-5">
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{member.id}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
								<UserCircle className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">İsim</p>
								<p className="font-semibold">{member.name || "—"}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
								<Mail className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">E-posta</p>
								<a
									href={`mailto:${member.email}`}
									className="text-brand hover:underline font-medium"
								>
									{member.email || "—"}
								</a>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] shrink-0">
								<Linkedin className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
								{member.linkedinUrl ? (
									<a
										href={member.linkedinUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-brand hover:underline font-medium"
									>
										Profil bağlantısı
									</a>
								) : (
									<p className="text-muted-foreground">—</p>
								)}
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
								<Users className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Fotoğraf</p>
								{member.photo ? (
									<img
										src={getPhotoUrl(member.photo)}
										alt={member.name}
										className="mt-2 h-20 w-20 rounded-full object-cover border-2 border-border/60"
									/>
								) : (
									<p className="text-muted-foreground text-sm">Yüklenmemiş</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Lokalizasyonlar</CardTitle>
						<CardDescription>
							Dil bazlı başlık ve açıklamalar
						</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{member.localizations && member.localizations.length > 0 ? (
							<div className="space-y-4">
								{member.localizations.map((loc: LocalizationItem, idx: number) => (
									<div
										key={`${loc.languageCode}-${idx}`}
										className="rounded-lg border border-border/60 p-4 space-y-2"
									>
										<div className="flex items-center gap-2">
											<Globe className="size-4 text-muted-foreground" />
											<Badge variant="secondary" className="font-mono">
												{loc.languageCode}
											</Badge>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Başlık</p>
											<p className="font-medium">{loc.title || "—"}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Açıklama</p>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{loc.description || "—"}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
								<Globe className="size-10 opacity-50" />
								<p className="text-sm">Henüz lokalizasyon eklenmemiş</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
