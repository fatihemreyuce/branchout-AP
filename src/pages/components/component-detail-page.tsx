import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
	Puzzle,
	ArrowLeft,
	Pencil,
	Type,
	Hash,
	Link2,
	Globe,
	FileImage,
	BadgeCheck,
	ExternalLink,
} from "lucide-react";
import { useComponentById } from "@/hooks/use-components";
import { useComponentTypeById } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { MediaVideoPlayer } from "@/components/ui/media-video-player";
import type { ComponentResponse, localizations } from "@/types/components.types";

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

/** API bazen asset dizisi bazen tek obje dönebiliyor; url/type/mime snake_case veya farklı isimlerle gelebilir */
function getFirstAssetFromGroup(ag: Record<string, unknown>): { url: string; type: string; mime: string } | null {
	const raw = Array.isArray(ag.asset) ? ag.asset[0] : ag.asset;
	if (!raw || typeof raw !== "object") return null;
	const a = raw as Record<string, unknown>;
	const url = String(a.url ?? a.Url ?? a.path ?? a.Path ?? "").trim();
	if (!url) return null;
	const type = String(a.type ?? a.Type ?? a.asset_type ?? a.assetType ?? "").toUpperCase();
	const mime = String(a.mime ?? a.mimeType ?? a.mime_type ?? "").toLowerCase();
	return { url, type, mime };
}

function normalizeComponent(data: unknown): ComponentResponse | null {
	if (!data || typeof data !== "object") return null;
	const item = data as Record<string, unknown>;
	const typeVal = item.type;
	const isTypeObject = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal);
	const typeObj = isTypeObject ? (typeVal as Record<string, unknown>) : {};
	const typeId = Number(item.typeId ?? item.type_id ?? typeObj?.id ?? typeObj?.Id ?? 0);
	const typeName =
		typeof typeVal === "string"
			? typeVal
			: String(typeObj.type ?? typeObj.Type ?? "");
	return {
		id: Number(item.id ?? item.Id ?? 0),
		name: String(item.name ?? item.Name ?? ""),
		typeId: typeId || (typeof typeVal === "number" ? typeVal : 0),
		type: {
			id: typeId,
			type: typeName,
			hasTitle: Boolean(typeObj.hasTitle ?? typeObj.has_title ?? false),
			hasExcerpt: Boolean(typeObj.hasExcerpt ?? typeObj.has_excerpt ?? false),
			hasDescription: Boolean(typeObj.hasDescription ?? typeObj.has_description ?? false),
			hasImage: Boolean(typeObj.hasImage ?? typeObj.has_image ?? false),
			hasValue: Boolean(typeObj.hasValue ?? typeObj.has_value ?? false),
			hasAsset: Boolean(typeObj.hasAsset ?? typeObj.has_asset ?? typeObj.hasAssets ?? false),
			photo: String(typeObj.photo ?? typeObj.Photo ?? ""),
			hasKind: Boolean(typeObj.hasKind ?? typeObj.has_kind ?? false),
		},
		value: item.value != null && item.value !== "" ? String(item.value) : String(item.Value ?? ""),
		link: String(item.link ?? item.Link ?? ""),
		localizations: Array.isArray(item.localizations) ? (item.localizations as localizations[]) : [],
		assets: Array.isArray(item.assets) ? item.assets : [],
	};
}

function MediaCard({
	assetUrl,
	isVideo,
	isImage,
	typeLabel,
	agId,
	sortOrder,
}: {
	assetUrl: string;
	isVideo: boolean;
	isImage: boolean;
	typeLabel: string;
	agId: unknown;
	sortOrder: unknown;
}) {
	const [imgError, setImgError] = React.useState(false);
	// URL var ama tip bilinmiyorsa önce img dene; yüklenmezse onError ile "Dosyayı aç" göster
	const showAsVideo = assetUrl && isVideo;
	const showAsImage = assetUrl && !isVideo && (isImage || !imgError);

	return (
		<div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-md">
			<div className="relative w-full overflow-hidden bg-muted" style={{ maxHeight: "12rem" }}>
				{showAsVideo ? (
					<MediaVideoPlayer
						videoSrc={assetUrl}
						className="w-full"
						thumbnailClassName="aspect-video w-full max-h-48 object-contain"
					/>
				) : showAsImage ? (
					<img
						src={assetUrl}
						alt={`Medya ${String(agId)}`}
						className="h-full w-full max-h-48 object-contain"
						onError={() => setImgError(true)}
					/>
				) : assetUrl ? (
					<a
						href={assetUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex h-full min-h-24 items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
					>
						<FileImage className="size-10" />
						<span className="text-sm">Dosyayı aç</span>
					</a>
				) : (
					<div className="flex min-h-24 items-center justify-center">
						<FileImage className="size-10 text-muted-foreground" />
					</div>
				)}
			</div>
			<div className="flex items-center justify-between gap-2 border-t border-border/60 bg-background/80 px-3 py-2">
				<span className="truncate text-xs font-medium text-foreground/90">{typeLabel} #{String(agId)}</span>
				<span className="shrink-0 text-xs text-muted-foreground">Sıra {String(sortOrder)}</span>
			</div>
		</div>
	);
}

const FEATURE_CONFIG: Record<string, { label: string; style: string }> = {
	hasTitle: { label: "Başlık", style: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400" },
	hasExcerpt: { label: "Özet", style: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400" },
	hasDescription: { label: "Açıklama", style: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
	hasImage: { label: "Görsel", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
	hasValue: { label: "Değer", style: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
	hasAsset: { label: "Medya", style: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400" },
	hasKind: { label: "Tür", style: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400" },
};

export default function ComponentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const compId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = useComponentById(compId);
	const raw =
		rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawComponent =
		raw != null && (raw.data !== undefined || raw.content !== undefined)
			? (raw.data ?? raw.content)
			: rawData;
	const comp = rawComponent != null ? normalizeComponent(rawComponent) : null;
	const typeId = comp?.typeId ?? 0;
	const { data: typeRaw, isLoading: typeLoading } = useComponentTypeById(typeId);
	const typeFromApi =
		typeRaw && typeof typeRaw === "object"
			? (typeRaw as Record<string, unknown>)
			: null;
	const resolvedType = typeFromApi
		? {
				id: Number(typeFromApi.id ?? typeFromApi.Id ?? 0),
				type: String(typeFromApi.type ?? typeFromApi.Type ?? ""),
				hasTitle: Boolean(typeFromApi.hasTitle ?? typeFromApi.has_title ?? false),
				hasExcerpt: Boolean(typeFromApi.hasExcerpt ?? typeFromApi.has_excerpt ?? false),
				hasDescription: Boolean(typeFromApi.hasDescription ?? typeFromApi.has_description ?? false),
				hasImage: Boolean(typeFromApi.hasImage ?? typeFromApi.has_image ?? false),
				hasValue: Boolean(typeFromApi.hasValue ?? typeFromApi.has_value ?? false),
				hasAsset: Boolean(typeFromApi.hasAsset ?? typeFromApi.has_asset ?? typeFromApi.hasAssets ?? false),
				hasKind: Boolean(typeFromApi.hasKind ?? typeFromApi.has_kind ?? false),
			}
		: comp?.type;

	if (!id || Number.isNaN(compId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz bileşen ID.</p>
				<Button variant="outline" onClick={() => navigate("/components")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="flex items-center gap-4">
					<div className="size-12 shrink-0 rounded-xl bg-muted animate-pulse" />
					<div className="space-y-2">
						<div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
						<div className="h-4 w-32 rounded bg-muted animate-pulse" />
					</div>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<Card className="overflow-hidden">
						<CardHeader className="border-b">
							<div className="h-5 w-32 rounded bg-muted animate-pulse" />
							<div className="h-4 w-48 rounded bg-muted/80 animate-pulse mt-1" />
						</CardHeader>
						<CardContent className="p-0">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex items-center gap-4 border-t px-6 py-4">
									<div className="size-10 rounded-xl bg-muted animate-pulse" />
									<div className="flex-1 space-y-1">
										<div className="h-3 w-16 rounded bg-muted animate-pulse" />
										<div className="h-4 w-full max-w-[200px] rounded bg-muted/80 animate-pulse" />
									</div>
								</div>
							))}
						</CardContent>
					</Card>
					<Card className="overflow-hidden">
						<CardHeader className="border-b">
							<div className="h-5 w-36 rounded bg-muted animate-pulse" />
							<div className="h-4 w-56 rounded bg-muted/80 animate-pulse mt-1" />
						</CardHeader>
						<CardContent className="p-6">
							<div className="flex flex-wrap gap-2">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-6 w-20 rounded-full bg-muted animate-pulse" />
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isError || !comp) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Bileşen bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/components")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8 pb-8">
			{/* Hero header */}
			<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/50 via-background to-brand/5 p-6 shadow-sm">
				<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4 min-w-0">
						<Button variant="outline" size="icon" asChild className="shrink-0 rounded-xl">
							<Link to="/components">
								<ArrowLeft className="size-4" />
							</Link>
						</Button>
						<div className="relative flex size-16 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 overflow-hidden shadow-inner">
							<BorderBeam size={60} duration={10} />
							<Puzzle className="size-8 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate md:text-3xl">
								{comp.name || `Bileşen #${comp.id}`}
							</h1>
							<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
								<span className="font-mono">ID {comp.id}</span>
								<span className="text-border">·</span>
								<span>{resolvedType?.type || comp.type?.type || "Bileşen"}</span>
							</div>
						</div>
					</div>
					<Button asChild className="gap-2 shrink-0 rounded-xl bg-brand text-brand-foreground shadow-md hover:bg-brand/90">
						<Link to={`/components/${comp.id}/edit`}>
							<Pencil className="size-4" />
							Düzenle
						</Link>
					</Button>
				</div>
			</div>

			{/* Temel bilgiler + Tip özellikleri */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
								<Puzzle className="size-4" />
							</span>
							Temel Bilgiler
						</CardTitle>
						<CardDescription>Ad, tip, değer ve link</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y divide-border/60">
							{[
								{ icon: Puzzle, label: "Ad", value: comp.name || "—", highlight: true },
								{ icon: Type, label: "Bileşen Tipi", value: comp.type?.type || "—" },
								{ icon: Hash, label: "Değer", value: comp.value || "—" },
							].map(({ icon: Icon, label, value, highlight }) => (
								<div
									key={label}
									className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/20"
								>
									<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
										<Icon className="size-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
										<p className={`truncate text-sm ${highlight ? "font-semibold text-foreground" : "text-foreground/90"}`}>
											{value}
										</p>
									</div>
								</div>
							))}
							{comp.link && (
								<div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/20">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
										<Link2 className="size-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Link</p>
										<a
											href={comp.link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-sm text-brand hover:underline break-all"
										>
											{comp.link}
											<ExternalLink className="size-3.5 shrink-0" />
										</a>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
								<BadgeCheck className="size-4" />
							</span>
							Tip Özellikleri
						</CardTitle>
						<CardDescription>Bu bileşen tipinin desteklediği alanlar</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{(resolvedType?.type || comp.type?.type) && (
							<p className="mb-4 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">{resolvedType?.type || comp.type?.type}</span>
							</p>
						)}
						<div className="flex flex-wrap gap-2">
							{(["hasTitle", "hasExcerpt", "hasDescription", "hasImage", "hasValue", "hasAsset", "hasKind"] as const).map((key) => {
								const isSupported = Boolean(resolvedType?.[key]);
								if (!isSupported) return null;
								return (
									<Badge
										key={key}
										variant="secondary"
										className={`gap-1.5 text-xs font-medium ${FEATURE_CONFIG[key]?.style ?? ""}`}
									>
										<BadgeCheck className="size-3" />
										{FEATURE_CONFIG[key]?.label ?? key}
									</Badge>
								);
							})}
							{typeId > 0 && typeLoading && !typeFromApi && (
								<p className="text-sm text-muted-foreground">Yükleniyor...</p>
							)}
							{typeId > 0 && !typeLoading && !typeFromApi && (
								<p className="text-sm text-muted-foreground">Tip detayı alınamadı.</p>
							)}
						</div>
						{!resolvedType?.type && !comp.type?.type && typeId <= 0 && (
							<p className="text-sm text-muted-foreground">Tip bilgisi yok</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Lokalizasyonlar + Medyalar yan yana */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
								<Globe className="size-4" />
							</span>
							Lokalizasyonlar
						</CardTitle>
						<CardDescription>Dil bazlı başlık, özet ve açıklama</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{comp.localizations && comp.localizations.length > 0 ? (
							<div className="space-y-4">
								{comp.localizations.map((loc, idx) => (
									<div
										key={idx}
										className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-transparent p-4 shadow-sm transition-shadow hover:shadow-md"
									>
										<Badge variant="secondary" className="mb-3 font-mono text-xs">
											{loc.languageCode}
										</Badge>
										<div className="space-y-3">
											{loc.title && (
												<div>
													<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Başlık</p>
													<p className="mt-0.5 text-sm font-medium text-foreground">{loc.title}</p>
												</div>
											)}
											{loc.excerpt && (
												<div>
													<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Özet</p>
													<p className="mt-0.5 text-sm text-foreground/90">{loc.excerpt}</p>
												</div>
											)}
											{loc.description && (
												<div>
													<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Açıklama</p>
													<p className="mt-0.5 text-sm whitespace-pre-wrap text-foreground/90">{loc.description}</p>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 py-12 text-center">
								<Globe className="size-12 text-muted-foreground/50" />
								<p className="mt-2 text-sm text-muted-foreground">Lokalizasyon yok</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
								<FileImage className="size-4" />
							</span>
							Medyalar
						</CardTitle>
						<CardDescription>Bileşene bağlı medya dosyaları {comp.assets?.length ? `(${comp.assets.length} adet)` : ""}</CardDescription>
					</CardHeader>
					<CardContent className="p-4">
						{comp.assets && comp.assets.length > 0 ? (
							<div className="space-y-3">
								{comp.assets.map((ag: Record<string, unknown>, idx: number) => {
									const first = getFirstAssetFromGroup(ag);
									const assetUrl = first ? getAssetUrl(first.url) : "";
									const isVideo = first ? first.type === "VIDEO" || first.mime.startsWith("video/") : false;
									const isImage = first ? first.type === "IMAGE" || first.mime.startsWith("image/") : false;
									const typeLabel = first?.type || "Medya";
									const agId = ag.id ?? ag.Id ?? idx;
									const sortOrder = ag.sortOrder ?? ag.sort_order ?? "—";
									return (
										<MediaCard
											key={String(agId)}
											assetUrl={assetUrl}
											isVideo={isVideo}
											isImage={isImage}
											typeLabel={typeLabel}
											agId={agId}
											sortOrder={sortOrder}
										/>
									);
								})}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 py-12 text-center">
								<FileImage className="size-12 text-muted-foreground/50" />
								<p className="mt-2 text-sm text-muted-foreground">Medya yok</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
