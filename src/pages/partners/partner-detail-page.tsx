import { Link, useParams, useNavigate } from "react-router-dom";
import { Handshake, ArrowLeft, Pencil, ImageIcon, Hash, ListOrdered } from "lucide-react";
import { usePartnerById } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

function getLogoUrl(logo: string): string {
	if (!logo) return "";
	if (logo.startsWith("http") || logo.startsWith("//")) return logo;
	return logo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${logo}` : logo;
}

export default function PartnerDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const partnerId = id ? Number(id) : NaN;
	const { data: partner, isLoading, isError } = usePartnerById(partnerId);

	if (!id || Number.isNaN(partnerId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz partner ID.</p>
				<Button variant="outline" onClick={() => navigate("/partners")}>
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

	if (isError || !partner) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Partner bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/partners")}>
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
						<Link to="/partners">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<Handshake className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Partner #{partner.id}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Logo ve sıra detayları
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/partners/${partner.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bilgiler</CardTitle>
					<CardDescription>Partner kimlik ve sıra bilgisi</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5">
							<div className="flex items-center gap-3">
								<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
									<ImageIcon className="size-5" />
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Logo</p>
									{partner.logo ? (
										<img
											src={getLogoUrl(partner.logo)}
											alt={`Partner ${partner.id}`}
											className="mt-2 h-20 w-auto max-w-[180px] object-contain rounded-lg border border-border/60 bg-muted/30 p-2"
										/>
									) : (
										<p className="text-sm text-muted-foreground">Logo yüklenmemiş</p>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-5">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{partner.id}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-5 sm:col-span-2">
							<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
								<ListOrdered className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Sıra numarası</p>
								<p className="font-semibold">{partner.orderIndex}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
