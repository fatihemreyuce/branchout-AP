import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
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
	Upload,
	ImageIcon,
	Check,
	Languages,
} from "lucide-react";
import { translateFromTurkish } from "@/utils/translate";
import { useComponentById, useUpdateComponent, useCreateComponentAsset, useDeleteComponentAsset } from "@/hooks/use-components";
import { useComponentTypes } from "@/hooks/use-component-type";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { ComponentResponse, localizations, assets } from "@/types/components.types";
import type { AssetResponse } from "@/types/assets.types";
import { ASSET_TYPE_OPTIONS } from "@/types/assets.types";
import { BorderBeam } from "@/components/ui/border-beam";

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function normalizeComponent(data: unknown): ComponentResponse | null {
	if (!data || typeof data !== "object") return null;
	const item = data as Record<string, unknown>;
	const typeVal = item.type;
	const typeObj =
		typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal)
			? (typeVal as Record<string, unknown>)
			: {};
	const typeIdFromType =
		typeof typeVal === "number" ? typeVal : typeObj?.id ?? typeObj?.Id;
	return {
		id: Number(item.id ?? item.Id ?? 0),
		name: String(item.name ?? item.Name ?? ""),
		typeId: Number(item.typeId ?? item.type_id ?? typeIdFromType ?? 0),
		type: {
			id: Number(typeObj.id ?? typeObj.Id ?? 0),
			type: String(typeObj.type ?? typeObj.Type ?? ""),
			hasTitle: Boolean(typeObj.hasTitle ?? typeObj.has_title ?? false),
			hasExcerpt: Boolean(typeObj.hasExcerpt ?? typeObj.has_excerpt ?? false),
			hasDescription: Boolean(typeObj.hasDescription ?? typeObj.has_description ?? false),
			hasImage: Boolean(typeObj.hasImage ?? typeObj.has_image ?? false),
			hasValue: Boolean(typeObj.hasValue ?? typeObj.has_value ?? false),
			hasAsset: Boolean(typeObj.hasAsset ?? typeObj.has_asset ?? typeObj.hasAssets ?? false),
			photo: String(typeObj.photo ?? typeObj.Photo ?? ""),
			hasKind: Boolean(typeObj.hasKind ?? typeObj.has_kind ?? false),
		},
		value: String(item.value ?? item.Value ?? ""),
		link: String(item.link ?? item.Link ?? ""),
		localizations: Array.isArray(item.localizations) ? (item.localizations as localizations[]) : [],
		assets: Array.isArray(item.assets) ? item.assets : [],
	};
}

export default function ComponentEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const compId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = useComponentById(compId);
	const updateComponent = useUpdateComponent();
	const createComponentAsset = useCreateComponentAsset();
	const deleteComponentAsset = useDeleteComponentAsset();
	const lastSyncedId = useRef<number | null>(null);
	const assetFileInputRef = useRef<HTMLInputElement>(null);

	const { data: typesData } = useComponentTypes("", 0, 100, "type,asc");

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["component-types"] });
	}, [queryClient]);
	const { data: assetsData } = useAssets("", 0, 100, "id,asc");
	const { data: languagesData } = useLanguages(0, 100, "id,asc");

	const [name, setName] = useState("");
	const [typeId, setTypeId] = useState<number | "">("");
	const [value, setValue] = useState("");
	const [link, setLink] = useState("");
	const [localizations, setLocalizations] = useState<localizations[]>([]);
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [newAssetFile, setNewAssetFile] = useState<File | null>(null);
	const [newAssetType, setNewAssetType] = useState("IMAGE");
	const [newAssetPreview, setNewAssetPreview] = useState<string | null>(null);
	const [additionalAssetIds, setAdditionalAssetIds] = useState<Set<number>>(new Set());
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

	const raw =
		rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawComponent =
		raw != null && (raw.data !== undefined || raw.content !== undefined)
			? (raw.data ?? raw.content)
			: rawData;
	const comp = rawComponent != null ? normalizeComponent(rawComponent) : null;

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
			hasKind: Boolean(x.hasKind ?? x.has_kind ?? false),
		}));
	}, [typesData]);

	const selectedType = useMemo(() => {
		const fromList = componentTypes.find((ct) => ct.id === typeId);
		if (fromList) return fromList;
		if (comp?.type) {
			return {
				id: comp.type.id,
				type: comp.type.type,
				hasTitle: comp.type.hasTitle,
				hasExcerpt: comp.type.hasExcerpt,
				hasDescription: comp.type.hasDescription,
				hasImage: comp.type.hasImage,
				hasValue: comp.type.hasValue,
				hasAsset: comp.type.hasAsset,
				hasKind: comp.type.hasKind,
			};
		}
		return undefined;
	}, [componentTypes, typeId, comp?.type]);

	const languages = useMemo(() => {
		const raw = languagesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			code: String(x.code ?? x.Code ?? ""),
		}));
	}, [languagesData]);

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

	const assetsList = useMemo(() => {
		const raw = assetsData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			url: String(x.url ?? x.Url ?? ""),
			type: String(x.type ?? x.Type ?? ""),
			mime: String(x.mime ?? x.Mime ?? ""),
			width: Number(x.width ?? x.Width ?? 0),
			height: Number(x.height ?? x.Height ?? 0),
			localizations: Array.isArray(x.localizations) ? x.localizations : [],
		})) as AssetResponse[];
	}, [assetsData]);

	const toggleAdditionalAsset = (id: number) => {
		setAdditionalAssetIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const isAssetInComponent = (assetId: number) => {
		return (comp?.assets as assets[] | undefined)?.some((ag) =>
			Array.isArray(ag.asset) && ag.asset.some((a: { id?: number }) => a.id === assetId)
		) ?? false;
	};

	useEffect(() => {
		if (comp && comp.id !== lastSyncedId.current) {
			lastSyncedId.current = comp.id;
			setName(comp.name || "");
			setTypeId(comp.typeId > 0 ? comp.typeId : "");
			setValue(comp.value || "");
			setLink(comp.link || "");
			setLocalizations(
				comp.localizations?.length
					? comp.localizations.map((l) => ({
							languageCode: l.languageCode || "",
							title: l.title || "",
							excerpt: l.excerpt || "",
							description: l.description || "",
						}))
					: []
			);
		}
	}, [comp]);

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

	const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) {
			setNewAssetFile(f);
			setNewAssetPreview(URL.createObjectURL(f));
		} else {
			setNewAssetFile(null);
			if (newAssetPreview) URL.revokeObjectURL(newAssetPreview);
			setNewAssetPreview(null);
		}
	};

	const handleAddAsset = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newAssetFile || Number.isNaN(compId) || compId <= 0) return;
		createComponentAsset.mutate(
			{
				id: compId,
				request: {
					file: newAssetFile,
					type: newAssetType,
					localizations: [],
				},
			},
			{
				onSuccess: () => {
					setAssetDialogOpen(false);
					setNewAssetFile(null);
					setNewAssetPreview(null);
					if (assetFileInputRef.current) assetFileInputRef.current.value = "";
				},
			}
		);
	};

	const handleDeleteAsset = (assetId: number) => {
		if (Number.isNaN(compId) || compId <= 0) return;
		deleteComponentAsset.mutate({ id: compId, assetId });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(compId) || compId <= 0 || typeId === "" || typeId <= 0) return;

		const cleanLocalizations = localizations.filter(
			(l) => l.languageCode && (l.title || l.excerpt || l.description)
		);

		const existingAssets = (comp?.assets as assets[] | undefined) ?? [];
		const additionalSelected = assetsList.filter((a) => additionalAssetIds.has(a.id));
		const additionalPayload: assets[] = additionalSelected.map((a, i) => ({
			id: 0,
			asset: [a],
			sortOrder: existingAssets.length + i,
			assetId: a.id,
			asset_id: a.id,
		}));
		const mergedAssets = [...existingAssets, ...additionalPayload];

		const payload = {
			name: name.trim() || "component",
			typeId: Number(typeId),
			value: value.trim(),
			link: link.trim(),
			localizations: cleanLocalizations,
			assets: mergedAssets,
		};

		updateComponent.mutate(
			{ id: compId, request: payload },
			{ onSuccess: () => navigate(`/components/${compId}`) }
		);
	};

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
						<div className="space-y-4">
							<div className="h-10 w-full bg-muted animate-pulse rounded" />
							<div className="h-10 w-full bg-muted animate-pulse rounded" />
							<div className="h-32 bg-muted animate-pulse rounded" />
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
						<Link to={`/components/${comp.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<Pencil className="size-6 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Bileşeni düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {comp.id} — {comp.name || "bilgileri güncelleyin"}
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="relative w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bileşen bilgileri</CardTitle>
					<CardDescription>
						Ad, tip, medya ve lokalizasyonları sırayla güncelleyin
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
									>
										<SelectTrigger id="typeId" className="max-w-md">
											<SelectValue placeholder="Tip seçin" />
										</SelectTrigger>
										<SelectContent>
											{componentTypes.map((ct) => (
												<SelectItem key={ct.id} value={String(ct.id)}>
													{ct.type || `Tip #${ct.id}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								{selectedType && (
									<div className="space-y-4 rounded-xl border border-border/60 bg-muted/10 p-4">
										<p className="text-xs text-muted-foreground">Seçilen tipe göre alanlar:</p>
										{selectedType.hasValue && (
											<div className="space-y-2">
												<Label htmlFor="value" className="flex items-center gap-2 text-sm">
													<Hash className="size-4" />
													Değer
												</Label>
												<Input
													id="value"
													value={value}
													onChange={(e) => setValue(e.target.value)}
													placeholder="İsteğe bağlı değer"
												/>
											</div>
										)}
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
									</div>
								)}
							</div>
						</div>

						<div className="border-t border-border/60" />

						{/* 3. Medya seçimi - yalnızca medya destekleyen tiplerde görünür */}
						{selectedType && !selectedType.hasAsset && (
							<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
								<p className="text-sm text-amber-700 dark:text-amber-400">
									<span className="font-medium">Medya bölümü:</span> Bu bileşen tipi ({selectedType.type}) medya desteklemiyor. Medya eklemek için farklı bir bileşen tipi seçin.
								</p>
							</div>
						)}
						{selectedType?.hasAsset && (
							<>
								<div className="space-y-4">
									<h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
										<span className="flex size-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">3</span>
										Medya seçimi
									</h3>
									<div className="pl-8 space-y-5">
										<p className="text-xs text-muted-foreground">
											Mevcut medyalardan ekleyin veya yeni dosya yükleyin
										</p>

										{/* Mevcut medyalardan seçim */}
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-3">Mevcut medyalardan seç</p>
											{assetsList.length === 0 ? (
												<div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 py-8">
													<FileImage className="size-10 text-muted-foreground" />
													<p className="text-sm text-muted-foreground">Henüz medya yok</p>
													<Button type="button" variant="outline" size="sm" asChild>
														<Link to="/assets/create">Medya oluştur</Link>
													</Button>
												</div>
											) : (
												<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
													{assetsList
														.filter((a) => !isAssetInComponent(a.id))
														.map((a) => {
															const isSelected = additionalAssetIds.has(a.id);
															return (
																<button
																	key={a.id}
																	type="button"
																	onClick={() => toggleAdditionalAsset(a.id)}
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

										{/* Mevcut bileşen medyaları + yeni yükleme */}
										<div>
											<div className="flex items-center justify-between mb-3">
												<p className="text-xs font-medium text-muted-foreground">Bileşene bağlı medyalar</p>
									<Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
										<DialogTrigger asChild>
											<Button type="button" variant="outline" size="sm" className="gap-1.5 border-brand-outline text-brand hover:bg-brand-muted">
												<Plus className="size-4" />
												Yeni medya
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-md">
											<DialogHeader>
												<DialogTitle>Medya ekle</DialogTitle>
												<DialogDescription>
													Dosya yükleyin ve medya tipini seçin
												</DialogDescription>
											</DialogHeader>
											<form onSubmit={handleAddAsset} className="space-y-4">
												<div className="space-y-2">
													<Label className="flex items-center gap-2">
														<Upload className="size-4" />
														Dosya
													</Label>
													<input
														ref={assetFileInputRef}
														type="file"
														accept="image/*,video/*,.pdf,.svg"
														onChange={handleAssetFileChange}
														className="hidden"
													/>
													<div
														onClick={() => assetFileInputRef.current?.click()}
														className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-6 cursor-pointer hover:border-brand/50 transition-colors min-h-[120px]"
													>
														{newAssetPreview ? (
															<>
																{newAssetFile?.type.startsWith("video/") ? (
																	<video src={newAssetPreview} className="max-h-20 rounded" controls />
																) : (
																	<img src={newAssetPreview} alt="Önizleme" className="max-h-20 rounded object-contain" />
																)}
																<p className="text-xs text-muted-foreground">{newAssetFile?.name}</p>
															</>
														) : (
															<>
																<ImageIcon className="size-10 text-muted-foreground" />
																<p className="text-sm text-muted-foreground">Tıklayarak dosya seçin</p>
															</>
														)}
													</div>
												</div>
												<div className="space-y-2">
													<Label>Tip</Label>
													<Select value={newAssetType} onValueChange={setNewAssetType}>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{ASSET_TYPE_OPTIONS.map((opt) => (
																<SelectItem key={opt.value} value={opt.value}>
																	{opt.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<DialogFooter>
													<Button type="button" variant="outline" onClick={() => setAssetDialogOpen(false)}>
														İptal
													</Button>
													<Button type="submit" disabled={!newAssetFile || createComponentAsset.isPending} className="gap-2">
														{createComponentAsset.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
														{createComponentAsset.isPending ? "Ekleniyor..." : "Ekle"}
													</Button>
												</DialogFooter>
											</form>
										</DialogContent>
									</Dialog>
								</div>
								{comp?.assets && comp.assets.length > 0 ? (
									<div className="grid gap-3 sm:grid-cols-2">
										{(comp.assets as assets[]).map((ag) => {
											const firstAsset = Array.isArray(ag.asset) && ag.asset[0] ? ag.asset[0] : null;
											const assetId = ag.id ?? (ag as { id?: number }).id;
											if (assetId == null) return null;
											return (
												<div
													key={assetId}
													className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
												>
													{firstAsset?.url ? (
														firstAsset.type === "VIDEO" ? (
															<video src={getAssetUrl(firstAsset.url)} className="size-14 rounded object-cover shrink-0" muted />
														) : (
															<img src={getAssetUrl(firstAsset.url)} alt="" className="size-14 rounded object-cover shrink-0" />
														)
													) : (
														<div className="flex size-14 items-center justify-center rounded bg-muted shrink-0">
															<FileImage className="size-6 text-muted-foreground" />
														</div>
													)}
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium truncate">
															{firstAsset?.type ?? "Medya"} #{assetId}
														</p>
														<p className="text-xs text-muted-foreground">Sıra: {ag.sortOrder ?? "—"}</p>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => handleDeleteAsset(assetId)}
														disabled={deleteComponentAsset.isPending}
														className="text-destructive hover:bg-destructive/10 shrink-0"
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											);
										})}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 py-8">
										<FileImage className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">Henüz medya eklenmedi</p>
										<p className="text-xs text-muted-foreground">Yeni medya ekle veya listeden seçin</p>
									</div>
								)}
										</div>
									</div>
								</div>
							</>
						)}

						<div className="border-t border-border/60" />

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
									<div>
										<p className="text-sm font-medium text-foreground">Lokalizasyon ekleyin</p>
										<p className="text-xs text-muted-foreground mt-1">
											Başlık, özet ve açıklama ile dil bazlı içerik ekleyin
										</p>
									</div>
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
												<span className="text-sm font-medium text-muted-foreground">
													Dil #{idx + 1}
												</span>
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
																const usedByOther = localizations.some(
																	(l, i) => i !== idx && l.languageCode === lang.code
																);
																return (
																	<SelectItem
																		key={lang.id}
																		value={lang.code}
																		disabled={usedByOther}
																	>
																		{lang.code}
																		{usedByOther && " (seçili)"}
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
												{selectedType?.hasDescription !== false && (
													<div className="space-y-2">
														<Label className="text-xs font-medium">Açıklama</Label>
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
												)}
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
								disabled={updateComponent.isPending || !name.trim() || typeId === "" || typeId <= 0}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updateComponent.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Pencil className="size-4" />
								)}
								{updateComponent.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/components/${comp.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
