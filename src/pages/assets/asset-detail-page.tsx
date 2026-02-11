import { Link, useParams, useNavigate } from "react-router-dom";
import {
	ImageIcon,
	ArrowLeft,
	Pencil,
	FileImage,
	Globe,
} from "lucide-react";
import { useAssetById } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaVideoPlayer } from "@/components/ui/media-video-player";
import type { AssetResponse } from "@/types/assets.types";

/** API snake_case dönebilir */
function normalizeAsset(data: unknown): AssetResponse {
	const item = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
	const locRaw = item.localizations ?? item.Localizations;
	const locs = Array.isArray(locRaw) ? locRaw : [];
	return {
		id: Number(item.id ?? item.Id ?? 0),
		url: String(item.url ?? item.Url ?? ""),
		type: String(item.type ?? item.Type ?? ""),
		mime: String(item.mime ?? item.Mime ?? ""),
		width: Number(item.width ?? item.Width ?? 0),
		height: Number(item.height ?? item.Height ?? 0),
		localizations: locs.map((l: Record<string, unknown>) => ({
			languageCode: String(l.languageCode ?? l.language_code ?? ""),
			title: String(l.title ?? l.Title ?? ""),
			description: String(l.description ?? l.Description ?? ""),
			subdescription: String(l.subdescription ?? l.Subdescription ?? ""),
		})),
	};
}

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function isImage(mime: string): boolean {
	return mime?.startsWith("image/") ?? false;
}

function isVideo(mime: string): boolean {
	return mime?.startsWith("video/") ?? false;
}

export default function AssetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const assetId = id ? Number(id) : NaN;
	const { data: assetData, isLoading, isError } = useAssetById(assetId);
	const asset = assetData ? normalizeAsset(assetData) : null;

	if (!id || Number.isNaN(assetId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz medya ID.</p>
				<Button variant="outline" onClick={() => navigate("/assets")}>
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

	if (isError || !asset) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Medya bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/assets")}>
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
						<Link to="/assets">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<ImageIcon className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Medya #{asset.id}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Tip: {asset.type} · {asset.width}×{asset.height}
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/assets/${asset.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Medya</CardTitle>
						<CardDescription>Dosya ve boyut bilgileri</CardDescription>
					</CardHeader>
					<CardContent className="p-6 space-y-5">
						{asset.url && isImage(asset.mime) ? (
							<div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
								<a
									href={getAssetUrl(asset.url)}
									target="_blank"
									rel="noopener noreferrer"
									title="Tam boyut görüntüle"
									className="block cursor-pointer"
								>
									<img
										src={getAssetUrl(asset.url)}
										alt={`Medya ${asset.id}`}
										className="w-full max-h-64 object-contain"
									/>
								</a>
							</div>
						) : asset.url && isVideo(asset.mime) ? (
							<div className="space-y-3">
								<MediaVideoPlayer
									videoSrc={getAssetUrl(asset.url)}
									className="w-full"
								/>
								<a
									href={getAssetUrl(asset.url)}
									target="_blank"
									rel="noopener noreferrer"
									title="Tam boyut görüntüle"
									className="block text-center text-sm text-brand hover:underline"
								>
									Yeni sekmede aç
								</a>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-8">
								<FileImage className="size-12 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">{asset.mime || "Medya"}</p>
								{asset.url && (
									<a
										href={getAssetUrl(asset.url)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-brand hover:underline"
									>
										Dosyayı aç
									</a>
								)}
							</div>
						)}
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{asset.id}</p>
							</div>
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="text-sm font-medium text-muted-foreground">Tip</p>
								<p className="font-medium">{asset.type || "—"}</p>
							</div>
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="text-sm font-medium text-muted-foreground">MIME</p>
								<p className="font-mono text-sm">{asset.mime || "—"}</p>
							</div>
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="text-sm font-medium text-muted-foreground">Boyut</p>
								<p className="font-medium">
									{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Lokalizasyonlar</CardTitle>
						<CardDescription>Dil bazlı başlık ve açıklamalar</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{asset.localizations && asset.localizations.length > 0 ? (
							<div className="space-y-4">
								{asset.localizations.map((loc, idx) => (
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
										{loc.subdescription && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">Alt açıklama</p>
												<p className="text-sm text-muted-foreground whitespace-pre-wrap">
													{loc.subdescription}
												</p>
											</div>
										)}
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
