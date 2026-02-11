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
import type { ComponentResponse, localizations } from "@/types/components.types";

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
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/components">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<Puzzle className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{comp.name || `Bileşen #${comp.id}`}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {comp.id} · {comp.type?.type || "Bileşen"} tipi
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/components/${comp.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Temel Bilgiler</CardTitle>
						<CardDescription>Ad, tip ve değer bilgileri</CardDescription>
					</CardHeader>
					<CardContent className="p-6 space-y-5">
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
								<Puzzle className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Ad</p>
								<p className="font-semibold truncate">{comp.name || "—"}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<Type className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Bileşen Tipi</p>
								<p className="font-medium">{comp.type?.type || "—"}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Değer</p>
								<p className="font-medium break-words">{comp.value || "—"}</p>
							</div>
						</div>
						{comp.link && (
							<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
								<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
									<Link2 className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-muted-foreground mb-1">Link</p>
									<a
										href={comp.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-brand hover:underline break-all"
									>
										{comp.link}
									</a>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Tip Özellikleri</CardTitle>
						<CardDescription>Bu bileşen tipinin desteklediği alanlar</CardDescription>
					</CardHeader>
					<CardContent className="p-6 space-y-3">
						{(resolvedType?.type || comp.type?.type) && (
							<p className="text-sm text-muted-foreground mb-3">
								Tip: <span className="font-medium text-foreground">{resolvedType?.type || comp.type?.type}</span>
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
										className={`gap-1 text-xs ${FEATURE_CONFIG[key]?.style ?? ""}`}
									>
										<BadgeCheck className="size-3" />
										{FEATURE_CONFIG[key]?.label ?? key}
									</Badge>
								);
							})}
							{typeId > 0 && typeLoading && !typeFromApi && (
								<p className="text-sm text-muted-foreground">Tip özellikleri yükleniyor...</p>
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

			{comp.localizations && comp.localizations.length > 0 && (
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg flex items-center gap-2">
							<Globe className="size-5 text-brand" />
							Lokalizasyonlar
						</CardTitle>
						<CardDescription>Dil bazlı içerikler</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						<div className="space-y-4">
							{comp.localizations.map((loc, idx) => (
								<div
									key={idx}
									className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
								>
									<Badge variant="secondary" className="font-mono">{loc.languageCode}</Badge>
									{loc.title && (
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-0.5">Başlık</p>
											<p className="text-sm">{loc.title}</p>
										</div>
									)}
									{loc.excerpt && (
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-0.5">Özet</p>
											<p className="text-sm">{loc.excerpt}</p>
										</div>
									)}
									{loc.description && (
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-0.5">Açıklama</p>
											<p className="text-sm whitespace-pre-wrap">{loc.description}</p>
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{comp.assets && comp.assets.length > 0 && (
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg flex items-center gap-2">
							<FileImage className="size-5 text-brand" />
							Medyalar
						</CardTitle>
						<CardDescription>Bileşene bağlı medya dosyaları</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{comp.assets.map((ag: { id?: number; asset?: { id: number; url?: string; type?: string }[]; sortOrder?: number }) => {
								const firstAsset = Array.isArray(ag.asset) && ag.asset[0] ? ag.asset[0] : null;
								const assetUrl = firstAsset?.url
									? firstAsset.url.startsWith("http") || firstAsset.url.startsWith("//")
										? firstAsset.url
										: firstAsset.url.startsWith("/")
											? `${import.meta.env.VITE_API_BASE_URL ?? ""}${firstAsset.url}`
											: firstAsset.url
									: "";
								return (
									<div
										key={ag.id ?? ag.sortOrder ?? Math.random()}
										className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden"
									>
										{assetUrl ? (
											firstAsset?.type === "VIDEO" ? (
												<video src={assetUrl} className="w-full aspect-video object-cover" controls muted />
											) : (
												<img src={assetUrl} alt="" className="w-full aspect-video object-cover" />
											)
										) : (
											<div className="flex aspect-video items-center justify-center bg-muted">
												<FileImage className="size-12 text-muted-foreground" />
											</div>
										)}
										<div className="p-3">
											<p className="text-sm font-medium">{firstAsset?.type ?? "Medya"} #{ag.id ?? "—"}</p>
											<p className="text-xs text-muted-foreground">Sıra: {ag.sortOrder ?? "—"}</p>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
