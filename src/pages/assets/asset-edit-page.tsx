import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
	ImageIcon,
	ArrowLeft,
	Loader2,
	Upload,
	Type,
	Globe,
	Plus,
	Trash2,
	Languages,
	Eye,
	CheckCircle2,
	FileImage,
} from "lucide-react";
import { useAssetById, useUpdateAsset } from "@/hooks/use-assets";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { translateFromTurkish } from "@/utils/translate";
import { ASSET_TYPE_OPTIONS, type localizations } from "@/types/assets.types";

type LocalizationFormItem = localizations & {
	titleSourceTr?: string;
	descriptionSourceTr?: string;
	subdescriptionSourceTr?: string;
};

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/")
		? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}`
		: url;
}

function isImage(mime: string): boolean {
	return mime?.startsWith("image/") ?? false;
}

/** API snake_case dönebilir */
function normalizeAsset(data: unknown) {
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

export default function AssetEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const assetId = id ? Number(id) : NaN;

	const { data: assetData, isLoading, isError } = useAssetById(assetId);
	const updateAsset = useUpdateAsset();
	const { data: languagesData } = useLanguages(0, 100, "id,asc");
	const languages = useMemo(() => {
		const raw = languagesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			code: String(x.code ?? x.Code ?? ""),
		}));
	}, [languagesData]);

	const asset = useMemo(() => (assetData ? normalizeAsset(assetData) : null), [assetData]);

	const [type, setType] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [localizations, setLocalizations] = useState<LocalizationFormItem[]>([]);
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

	useEffect(() => {
		if (asset) {
			setType(asset.type && ["IMAGE", "FILE", "VIDEO"].includes(asset.type) ? asset.type : "IMAGE");
			setLocalizations(asset.localizations?.length ? [...asset.localizations] : []);
			if (!file) {
				const url = asset.url && isImage(asset.mime) ? getAssetUrl(asset.url) : null;
				setFilePreview(url);
			}
		}
	}, [asset, file]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) {
			setFile(f);
			setFilePreview(URL.createObjectURL(f));
		} else {
			setFile(null);
			if (filePreview && !asset?.url) URL.revokeObjectURL(filePreview);
			setFilePreview(
				asset?.url && isImage(asset.mime) ? getAssetUrl(asset.url) : null
			);
		}
	};

	const addLocalization = () => {
		setLocalizations((prev) => [
			...prev,
			{ languageCode: "", title: "", description: "", subdescription: "" },
		]);
	};

	const updateLocalization = (idx: number, field: keyof LocalizationFormItem, value: string) => {
		setLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: value } : loc))
		);
	};

	const handleTranslate = async (
		idx: number,
		field: "title" | "description" | "subdescription"
	) => {
		const loc = localizations[idx];
		if (!loc?.languageCode) return;
		const sourceTr = loc[field] ?? "";
		if (!sourceTr?.trim()) return;

		setTranslatingIdx(idx);
		try {
			const translated = await translateFromTurkish(sourceTr, loc.languageCode);
			updateLocalization(idx, field, translated);
		} finally {
			setTranslatingIdx(null);
		}
	};

	const removeLocalization = (idx: number) => {
		setLocalizations((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(assetId) || !asset) return;

		const cleanLocalizations = localizations
			.filter(
				(l) => l.languageCode || l.title || l.description || l.subdescription
			)
			.map(
				({
					titleSourceTr: _1,
					descriptionSourceTr: _2,
					subdescriptionSourceTr: _3,
					...rest
				}) => rest
			);

		const filePayload: File | string = file ?? (asset.url ?? "");
		const payload = {
			file: filePayload,
			type: type || "IMAGE",
			localizations: cleanLocalizations,
		};

		updateAsset.mutate(
			{ id: assetId, request: payload },
			{ onSuccess: () => navigate(`/assets/${assetId}`) }
		);
	};

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

	if (isLoading || !asset) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="h-40 w-full max-w-md bg-muted animate-pulse rounded-xl" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
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
						<Link to={`/assets/${asset.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<ImageIcon className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Medya düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {asset.id} — bilgileri güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Medya bilgileri</CardTitle>
					<CardDescription>
						Dosya, tip ve lokalizasyonları güncelleyin (yeni dosya seçmezseniz mevcut kalır)
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4">
							<Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
								<Type className="size-4 text-muted-foreground" />
								Tip
							</Label>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger id="type" className="w-full">
									<SelectValue placeholder="Tip seçin" />
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

						<div className="space-y-4">
							<Label className="flex items-center gap-2 text-sm font-medium">
								<Upload className="size-4 text-muted-foreground" />
								Dosya (değiştirmek için yeni seçin)
							</Label>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*,video/*,audio/*,.pdf,.svg"
								onChange={handleFileChange}
								className="hidden"
							/>
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 cursor-pointer hover:border-brand-ring hover:bg-brand-muted transition-colors min-h-[180px]"
							>
								{filePreview ? (
									isImage(asset.mime) && !file ? (
										<>
											<img
												src={filePreview}
												alt="Mevcut dosya"
												className="max-h-32 w-auto object-contain rounded border border-border/60"
											/>
											<p className="text-sm text-muted-foreground">
												Mevcut dosya. Değiştirmek için tıklayın.
											</p>
										</>
									) : (
										<>
											<img
												src={filePreview}
												alt="Önizleme"
												className="max-h-32 w-auto object-contain rounded border border-border/60"
											/>
											<p className="text-sm text-muted-foreground">
												{file?.name} · Değiştirmek için tıklayın
											</p>
										</>
									)
								) : (
									<>
										<FileImage className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Yeni dosya yüklemek için tıklayın
										</p>
										<p className="text-xs text-muted-foreground">
											Görsel, video, ses veya PDF
										</p>
									</>
								)}
							</div>
						</div>

						<div className="space-y-5 border-t border-border/60 pt-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold flex items-center gap-2">
										<Globe className="size-4 text-brand" />
										Lokalizasyonlar
									</h3>
									<p className="text-xs text-muted-foreground mt-0.5">
										Her dil için başlık, açıklama ve alt açıklama ekleyin
									</p>
								</div>
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
											Türkçe metni girin ve hedef dil seçerek çeviri yapın
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
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-muted-foreground">
														Dil #{idx + 1}
													</span>
													{loc.languageCode && (
														<Badge variant="secondary" className="font-mono text-xs">
															{loc.languageCode}
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-1">
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
												<div className="space-y-2">
													<Label className="text-xs font-medium">Başlık</Label>
													<div className="flex gap-2">
														<Input
															value={loc.title ?? ""}
															onChange={(e) => updateLocalization(idx, "title", e.target.value)}
															placeholder="Örn: Hero Banner"
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
													{loc.title && (
														<Popover>
															<PopoverTrigger asChild>
																<button
																	type="button"
																	className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-left text-sm hover:bg-emerald-500/10 transition-colors"
																>
																	<CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
																	<span className="truncate flex-1 text-foreground">
																		{loc.title}
																	</span>
																	<Eye className="size-4 text-muted-foreground shrink-0" />
																</button>
															</PopoverTrigger>
															<PopoverContent className="max-w-md" align="start">
																<p className="text-xs font-medium text-muted-foreground mb-1">
																	Başlık ({loc.languageCode})
																</p>
																<p className="text-sm whitespace-pre-wrap">{loc.title}</p>
															</PopoverContent>
														</Popover>
													)}
												</div>

												<div className="space-y-2">
													<Label className="text-xs font-medium">Açıklama</Label>
													<div className="flex gap-2 items-start">
														<Textarea
															value={loc.description ?? ""}
															onChange={(e) =>
																updateLocalization(idx, "description", e.target.value)
															}
															placeholder="Türkçe açıklama girin..."
															className="min-h-[80px] flex-1 resize-none"
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
													{loc.description && (
														<Popover>
															<PopoverTrigger asChild>
																<button
																	type="button"
																	className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-left text-sm hover:bg-emerald-500/10 transition-colors"
																>
																	<CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
																	<span className="truncate flex-1 text-foreground min-w-0">
																		{loc.description}
																	</span>
																	<Eye className="size-4 text-muted-foreground shrink-0" />
																</button>
															</PopoverTrigger>
															<PopoverContent className="max-w-md max-h-64 overflow-y-auto" align="start">
																<p className="text-xs font-medium text-muted-foreground mb-1">
																	Açıklama ({loc.languageCode})
																</p>
																<p className="text-sm whitespace-pre-wrap">{loc.description}</p>
															</PopoverContent>
														</Popover>
													)}
												</div>

												<div className="space-y-2">
													<Label className="text-xs font-medium">Alt açıklama</Label>
													<div className="flex gap-2 items-start">
														<Textarea
															value={loc.subdescription ?? ""}
															onChange={(e) =>
																updateLocalization(idx, "subdescription", e.target.value)
															}
															placeholder="İsteğe bağlı alt açıklama..."
															className="min-h-[60px] flex-1 resize-none"
															rows={2}
														/>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onClick={() => handleTranslate(idx, "subdescription")}
															disabled={
																!loc.languageCode ||
																!loc.subdescription?.trim() ||
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
													{loc.subdescription && (
														<Popover>
															<PopoverTrigger asChild>
																<button
																	type="button"
																	className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-left text-sm hover:bg-emerald-500/10 transition-colors"
																>
																	<CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
																	<span className="truncate flex-1 text-foreground min-w-0">
																		{loc.subdescription}
																	</span>
																	<Eye className="size-4 text-muted-foreground shrink-0" />
																</button>
															</PopoverTrigger>
															<PopoverContent className="max-w-md max-h-64 overflow-y-auto" align="start">
																<p className="text-xs font-medium text-muted-foreground mb-1">
																	Alt açıklama ({loc.languageCode})
																</p>
																<p className="text-sm whitespace-pre-wrap">{loc.subdescription}</p>
															</PopoverContent>
														</Popover>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
							<Button
								type="submit"
								disabled={updateAsset.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updateAsset.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<ImageIcon className="size-4" />
								)}
								{updateAsset.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/assets/${asset.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
