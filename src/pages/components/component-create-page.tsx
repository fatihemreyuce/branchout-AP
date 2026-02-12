import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
	Puzzle,
	ArrowLeft,
	Loader2,
	Type,
	Link2,
	Hash,
	Globe,
	Plus,
	Trash2,
	Pencil,
	FileImage,
	Check,
	Languages,
} from "lucide-react";
import { translateFromTurkish } from "@/utils/translate";
import { useCreateComponent } from "@/hooks/use-components";
import { useComponentTypes, useComponentTypeById } from "@/hooks/use-component-type";
import { useAssets } from "@/hooks/use-assets";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BorderBeam } from "@/components/ui/border-beam";
import type { localizations, assets } from "@/types/components.types";
import type { AssetResponse } from "@/types/assets.types";

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function normalizeAssetsList(data: unknown): AssetResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data ?? [];
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		return {
			id: Number(item.id ?? item.Id ?? 0),
			url: String(item.url ?? item.Url ?? ""),
			type: String(item.type ?? item.Type ?? ""),
			mime: String(item.mime ?? item.Mime ?? ""),
			width: Number(item.width ?? item.Width ?? 0),
			height: Number(item.height ?? item.Height ?? 0),
			localizations: Array.isArray(item.localizations) ? item.localizations : [],
		} as AssetResponse;
	});
}

export default function ComponentCreatePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createComponent = useCreateComponent();

	const { data: typesData, isLoading: typesLoading } = useComponentTypes("", 0, 100, "type,asc");

	const [name, setName] = useState("");
	const [typeId, setTypeId] = useState<number | "">("");
	const [value, setValue] = useState("");
	const [link, setLink] = useState("");

	const selectedTypeId = typeId !== "" && Number(typeId) > 0 ? Number(typeId) : 0;
	const { data: selectedTypeDetail } = useComponentTypeById(selectedTypeId);

	// Bileşen tipi listesini sayfa açıldığında tazele (Medya alanı güncel görünsün)
	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["component-types"] });
	}, [queryClient]);
	const { data: assetsData } = useAssets("", 0, 100, "id,asc");
	const { data: languagesData } = useLanguages(0, 100, "id,asc");
	const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number>>(new Set());
	const [localizations, setLocalizations] = useState<localizations[]>([]);
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

	const handleTranslate = async (
		idx: number,
		field: "title" | "excerpt" | "description"
	) => {
		const loc = localizations[idx];
		if (!loc?.languageCode) return;
		const sourceTr = (loc[field] ?? "").trim();
		if (!sourceTr) return;

		setTranslatingIdx(idx);
		try {
			const translated = await translateFromTurkish(sourceTr, loc.languageCode);
			updateLocalization(idx, field, translated);
		} finally {
			setTranslatingIdx(null);
		}
	};

	const componentTypes = useMemo(() => {
		const raw = typesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			type: String(x.type ?? x.Type ?? ""),
			hasTitle: Boolean(x.hasTitle ?? x.has_title ?? false),
			hasExcerpt: Boolean(x.hasExcerpt ?? x.has_excerpt ?? false),
			hasDescription: Boolean(x.hasDescription ?? x.has_description ?? false),
			hasImage: Boolean(x.hasImage ?? x.has_image ?? false),
			hasValue: Boolean(x.hasValue ?? x.has_value ?? false),
			hasAsset: Boolean(x.hasAsset ?? x.has_asset ?? x.hasAssets ?? false),
			hasLink: Boolean(x.hasLink ?? x.has_link ?? x.hasKind ?? x.has_kind ?? false),
			link: String(x.link ?? x.Link ?? x.kind ?? x.Kind ?? ""),
		}));
	}, [typesData]);

	const selectedType = useMemo(
		() => componentTypes.find((ct) => ct.id === typeId),
		[componentTypes, typeId]
	);

	// Seçilen bileşen tipinin link değerini detay API'sinden çekip Link alanına yaz (liste API'si link döndürmeyebilir)
	const typeLinkFromDetail = useMemo(() => {
		if (!selectedTypeDetail || typeof selectedTypeDetail !== "object") return "";
		const t = selectedTypeDetail as Record<string, unknown>;
		return String(t.link ?? t.Link ?? t.kind ?? t.Kind ?? "").trim();
	}, [selectedTypeDetail]);
	const typeHasLinkFromDetail = useMemo(() => {
		if (!selectedTypeDetail || typeof selectedTypeDetail !== "object") return false;
		const t = selectedTypeDetail as Record<string, unknown>;
		return Boolean(t.hasLink ?? t.has_link ?? t.hasKind ?? t.has_kind ?? false);
	}, [selectedTypeDetail]);
	useEffect(() => {
		if (!selectedType) return;
		if (typeHasLinkFromDetail) setLink(typeLinkFromDetail);
		else if (!selectedType.hasLink) setLink("");
	}, [selectedType?.id, selectedType?.hasLink, typeHasLinkFromDetail, typeLinkFromDetail]);

	const assetsList = useMemo(() => normalizeAssetsList(assetsData), [assetsData]);

	const languages = useMemo(() => {
		const raw = languagesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			code: String(x.code ?? x.Code ?? ""),
		}));
	}, [languagesData]);

	const toggleAsset = (id: number) => {
		setSelectedAssetIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const addLocalization = () => {
		setLocalizations((prev) => [
			...prev,
			{ languageCode: "", title: "", excerpt: "", description: "" },
		]);
	};

	const updateLocalization = (idx: number, field: keyof localizations, val: string) => {
		setLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: val } : loc))
		);
	};

	const removeLocalization = (idx: number) => {
		setLocalizations((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (typeId === "" || typeId <= 0) return;

		const cleanLocalizations = localizations.filter(
			(l) => l.languageCode && (l.title || l.excerpt || l.description)
		);

		const selectedAssets = assetsList.filter((a) => selectedAssetIds.has(a.id));
		const assetsPayload: assets[] = selectedAssets.map((a, i) => ({
			id: 0,
			asset: [a],
			sortOrder: i,
			assetId: a.id,
			asset_id: a.id,
		}));

		const payload = {
			name: name.trim() || "component",
			typeId: Number(typeId),
			value: value.trim(),
			link: link.trim(),
			localizations: cleanLocalizations,
			assets: assetsPayload,
		};

		createComponent.mutate(payload, {
			onSuccess: () => navigate("/components"),
		});
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/components">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<Puzzle className="size-6 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">Yeni Bileşen</h1>
							<p className="text-muted-foreground text-sm mt-0.5">Yeni bileşen oluşturun</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="relative w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bileşen bilgileri</CardTitle>
					<CardDescription>
						Ad, tip, medya ve lokalizasyonları sırayla belirleyin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* 1. Ad */}
						<div className="space-y-4">
							<h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
								<span className="flex size-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">1</span>
								Ad
							</h3>
							<div className="pl-8">
								<Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
									<Pencil className="size-4 text-muted-foreground" />
									Bileşen adı
								</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Örn: Hero Banner"
									className="mt-2 max-w-md"
									required
								/>
							</div>
						</div>

						<div className="border-t border-border/60" />

						{/* 2. Bileşen Tipi + dinamik alanlar */}
						<div className="space-y-4">
							<h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
								<span className="flex size-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">2</span>
								Bileşen Tipi
							</h3>
							<div className="pl-8 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="typeId" className="flex items-center gap-2 text-sm font-medium">
										<Type className="size-4 text-muted-foreground" />
										Tip seçin
									</Label>
									<Select
										value={typeId === "" ? "" : String(typeId)}
										onValueChange={(v) => setTypeId(v ? Number(v) : "")}
										disabled={componentTypes.length === 0}
									>
										<SelectTrigger id="typeId" className="max-w-md">
											<SelectValue
												placeholder={
													typesLoading
														? "Yükleniyor..."
														: componentTypes.length === 0
															? "Önce bileşen tipi oluşturun"
															: "Tip seçin"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{componentTypes.map((ct) => (
												<SelectItem key={ct.id} value={String(ct.id)}>
													{ct.type || `Tip #${ct.id}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{componentTypes.length === 0 && (
										<p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
											<Link to="/component-types/create" className="underline font-medium">
												Bileşen tipi oluşturun
											</Link>
										</p>
									)}
								</div>

								{selectedType && (
									<div className="space-y-4 rounded-xl border border-border/60 bg-muted/10 p-4">
										<p className="text-xs text-muted-foreground">Seçilen tipe göre alanlar:</p>
										{selectedType.hasValue && (
											<div className="space-y-2">
												<Label htmlFor="value" className="flex items-center gap-2 text-sm">
													<Hash className="size-4" />
													Değer (value)
												</Label>
												<Input
													id="value"
													value={value}
													onChange={(e) => setValue(e.target.value)}
													placeholder="Bileşen değeri"
												/>
											</div>
										)}
										{selectedType.hasLink && (
											<div className="space-y-2">
												<Label htmlFor="link" className="flex items-center gap-2 text-sm">
													<Link2 className="size-4" />
													Link
												</Label>
												<Input
													id="link"
													type="url"
													value={link}
													onChange={(e) => setLink(e.target.value)}
													placeholder="https://..."
												/>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="border-t border-border/60" />

						{/* 3. Medya seçimi */}
						{selectedType?.hasAsset && (
							<>
								<div className="space-y-4">
									<h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
										<span className="flex size-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">3</span>
										Medya seçimi
									</h3>
									<div className="pl-8">
										<p className="text-xs text-muted-foreground mb-4">
											Mevcut medyalardan bileşene eklemek istediklerinizi seçin
										</p>
										{assetsList.length === 0 ? (
											<div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 py-12">
												<FileImage className="size-12 text-muted-foreground" />
												<p className="text-sm text-muted-foreground">Henüz medya yok</p>
												<Button type="button" variant="outline" size="sm" asChild>
													<Link to="/assets/create">Medya oluştur</Link>
												</Button>
											</div>
										) : (
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
												{assetsList.map((a) => {
													const isSelected = selectedAssetIds.has(a.id);
													return (
														<button
															key={a.id}
															type="button"
															onClick={() => toggleAsset(a.id)}
															className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${
																isSelected
																	? "border-brand bg-brand/5 ring-2 ring-brand/30"
																	: "border-border/60 hover:border-border"
															}`}
														>
															<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
																{a.type === "VIDEO" ? (
																	<video src={getAssetUrl(a.url)} className="size-12 object-cover" muted />
																) : a.mime?.startsWith("image/") ? (
																	<img src={getAssetUrl(a.url)} alt="" className="size-12 object-cover" />
																) : (
																	<FileImage className="size-6 text-muted-foreground" />
																)}
															</div>
															<div className="min-w-0 flex-1">
																<p className="text-sm font-medium truncate">#{a.id}</p>
																<p className="text-xs text-muted-foreground">{a.type}</p>
															</div>
															<div className="shrink-0">
																{isSelected ? (
																	<div className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
																		<Check className="size-3" />
																	</div>
																) : (
																	<div className="size-5 rounded-full border-2 border-muted-foreground/30" />
																)}
															</div>
														</button>
													);
												})}
											</div>
										)}
									</div>
								</div>
								<div className="border-t border-border/60" />
							</>
						)}
						{selectedType && !selectedType.hasAsset && (
							<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
								<p className="text-sm text-amber-700 dark:text-amber-400">
									<span className="font-medium">Medya bölümü:</span> Bu bileşen tipi ({selectedType.type}) medya desteklemiyor. Medya eklemek için farklı bir bileşen tipi seçin.
								</p>
							</div>
						)}

						{/* 4. Lokalizasyonlar */}
						<div className="space-y-5">
							<h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
								<span className="flex size-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">
									{selectedType?.hasAsset ? "4" : "3"}
								</span>
								Lokalizasyonlar
							</h3>
							<div className="pl-8 space-y-5">
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">
										{selectedType
											? "Türkçe metni girin ve hedef dil seçerek Çevir ile çeviri yapın"
											: "Önce bileşen tipi seçin"}
									</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addLocalization}
										className="gap-1.5 border-brand-outline text-brand hover:bg-brand-muted"
									>
										<Plus className="size-4" />
										Yeni dil
									</Button>
								</div>

								{localizations.length === 0 ? (
									<button
										type="button"
										onClick={addLocalization}
										className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 hover:border-brand/50 hover:bg-brand-muted/10 p-10 cursor-pointer transition-all group"
									>
										<div className="flex size-14 items-center justify-center rounded-full bg-brand-muted/50 text-brand group-hover:bg-brand-muted transition-colors">
											<Globe className="size-7" />
										</div>
										<p className="text-sm font-medium text-foreground">Lokalizasyon ekleyin</p>
										<p className="text-xs text-muted-foreground">
											Başlık, özet ve açıklama ile dil bazlı içerik
										</p>
										<span className="text-xs text-brand font-medium flex items-center gap-1">
											<Plus className="size-3" />
											İlk dil eklemek için tıklayın
										</span>
									</button>
								) : (
									<div className="space-y-4">
										{localizations.map((loc, idx) => (
											<div
												key={idx}
												className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden ring-1 ring-border/40"
											>
												<div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/60">
													<span className="text-sm font-medium text-muted-foreground">Dil #{idx + 1}</span>
													<div className="flex items-center gap-2">
														<Select
															value={loc.languageCode}
															onValueChange={(v) => updateLocalization(idx, "languageCode", v)}
														>
															<SelectTrigger className="w-[120px] h-8">
																<SelectValue placeholder="Dil seç" />
															</SelectTrigger>
															<SelectContent>
																{languages.map((lang) => {
																	const used = localizations.some((l, i) => i !== idx && l.languageCode === lang.code);
																	return (
																		<SelectItem key={lang.id} value={lang.code} disabled={used}>
																			{lang.code}
																			{used && " (seçili)"}
																		</SelectItem>
																	);
																})}
															</SelectContent>
														</Select>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeLocalization(idx)}
															className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
														>
															<Trash2 className="size-4" />
														</Button>
													</div>
												</div>
												<div className="p-4 space-y-4">
													{selectedType?.hasTitle !== false && (
														<div className="space-y-2">
															<Label className="text-xs font-medium">Başlık</Label>
															<div className="flex gap-2">
																<Input
																	value={loc.title}
																	onChange={(e) => updateLocalization(idx, "title", e.target.value)}
																	placeholder="Türkçe metin girin, hedef dil seçip Çevir ile çevirin"
																	className="flex-1"
																/>
																<Button
																	type="button"
																	variant="secondary"
																	size="sm"
																	onClick={() => handleTranslate(idx, "title")}
																	disabled={
																		!loc.languageCode ||
																		!loc.title?.trim() ||
																		translatingIdx === idx
																	}
																	className="gap-1.5 shrink-0"
																>
																	{translatingIdx === idx ? (
																		<Loader2 className="size-4 animate-spin" />
																	) : (
																		<Languages className="size-4" />
																	)}
																	Çevir
																</Button>
															</div>
														</div>
													)}
													{selectedType?.hasExcerpt !== false && (
														<div className="space-y-2">
															<Label className="text-xs font-medium">Özet</Label>
															<div className="flex gap-2">
																<Input
																	value={loc.excerpt}
																	onChange={(e) => updateLocalization(idx, "excerpt", e.target.value)}
																	placeholder="Kısa özet"
																	className="flex-1"
																/>
																<Button
																	type="button"
																	variant="secondary"
																	size="sm"
																	onClick={() => handleTranslate(idx, "excerpt")}
																	disabled={
																		!loc.languageCode ||
																		!loc.excerpt?.trim() ||
																		translatingIdx === idx
																	}
																	className="gap-1.5 shrink-0"
																>
																	{translatingIdx === idx ? (
																		<Loader2 className="size-4 animate-spin" />
																	) : (
																		<Languages className="size-4" />
																	)}
																	Çevir
																</Button>
															</div>
														</div>
													)}
													<div className="space-y-2">
														<Label className="text-xs font-medium">Açıklama (description)</Label>
															<div className="flex gap-2">
																<Textarea
																	value={loc.description}
																	onChange={(e) => updateLocalization(idx, "description", e.target.value)}
																	placeholder="Detaylı açıklama"
																	className="min-h-[80px] resize-none flex-1"
																	rows={3}
																/>
																<Button
																	type="button"
																	variant="secondary"
																	size="sm"
																	onClick={() => handleTranslate(idx, "description")}
																	disabled={
																		!loc.languageCode ||
																		!loc.description?.trim() ||
																		translatingIdx === idx
																	}
																	className="gap-1.5 shrink-0 self-start"
																>
																	{translatingIdx === idx ? (
																		<Loader2 className="size-4 animate-spin" />
																	) : (
																		<Languages className="size-4" />
																	)}
																	Çevir
																</Button>
															</div>
														</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
							<Button
								type="submit"
								disabled={createComponent.isPending || !name.trim() || typeId === "" || typeId <= 0}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createComponent.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Puzzle className="size-4" />
								)}
								{createComponent.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/components">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
