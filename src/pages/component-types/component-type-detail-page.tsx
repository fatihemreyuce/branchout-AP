import { Link, useParams, useNavigate } from "react-router-dom";
import {
	Layout,
	ArrowLeft,
	Pencil,
	FileImage,
	Check,
	X,
} from "lucide-react";
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
import type { ComponentTypeResponse } from "@/types/components.type.types";

function getPhotoUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function normalizeComponentType(data: unknown): ComponentTypeResponse {
	const item = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
	return {
		id: Number(item.id ?? item.Id ?? 0),
		type: String(item.type ?? item.Type ?? ""),
		hasTitle: Boolean(item.hasTitle ?? item.has_title ?? false),
		hasExcerpt: Boolean(item.hasExcerpt ?? item.has_excerpt ?? false),
		hasDescription: Boolean(item.hasDescription ?? item.has_description ?? false),
		hasImage: Boolean(item.hasImage ?? item.has_image ?? false),
		hasValue: Boolean(item.hasValue ?? item.has_value ?? false),
		hasAsset: Boolean(item.hasAsset ?? item.has_asset ?? item.hasAssets ?? false),
		photo: String(item.photo ?? item.Photo ?? ""),
		hasKind: Boolean(item.hasKind ?? item.has_kind ?? false),
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

export default function ComponentTypeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const ctId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = useComponentTypeById(ctId);
	const ct = rawData ? normalizeComponentType(rawData) : null;

	if (!id || Number.isNaN(ctId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz bileşen tipi ID.</p>
				<Button variant="outline" onClick={() => navigate("/component-types")}>
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

	if (isError || !ct) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Bileşen tipi bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/component-types")}>
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
						<Link to="/component-types">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<Layout className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{ct.type || `Bileşen #${ct.id}`}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {ct.id} · Bileşen tipi detayı
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/component-types/${ct.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Görsel</CardTitle>
						<CardDescription>Bileşen tipi fotoğrafı</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{ct.photo ? (
							<div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
								<img
									src={getPhotoUrl(ct.photo)}
									alt={`Bileşen ${ct.id}`}
									className="w-full max-h-64 object-contain"
								/>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-8">
								<FileImage className="size-12 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">Fotoğraf yok</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm overflow-hidden">
					<CardHeader className="border-b border-border/60 bg-muted/20">
						<CardTitle className="text-lg">Özellikler</CardTitle>
						<CardDescription>Bu bileşen tipinin desteklediği alanlar</CardDescription>
					</CardHeader>
					<CardContent className="p-6 space-y-5">
						<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
							<p className="text-sm font-medium text-muted-foreground mb-1">Tip</p>
							<p className="font-medium">{ct.type || "—"}</p>
						</div>
						<div className="space-y-3">
							<p className="text-sm font-medium text-muted-foreground">Alanlar</p>
							<div className="grid gap-2 sm:grid-cols-2">
								{(["hasTitle", "hasExcerpt", "hasDescription", "hasImage", "hasValue", "hasAsset", "hasKind"] as const).map((key) => (
									<div
										key={key}
										className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
									>
										<span className="text-sm font-medium">{FEATURE_CONFIG[key].label}</span>
										{ct[key] ? (
											<Badge variant="secondary" className={`gap-1 ${FEATURE_CONFIG[key].style}`}>
												<Check className="size-3" />
												Var
											</Badge>
										) : (
											<Badge variant="secondary" className="gap-1 opacity-60">
												<X className="size-3" />
												Yok
											</Badge>
										)}
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
