import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
	Layout,
	ArrowLeft,
	Loader2,
	Upload,
	Type,
	ImageIcon,
	FileText,
	Hash,
	FileImage,
	Image,
	Check,
	Link2,
} from "lucide-react";
import { useComponentTypeById, useUpdateComponentType } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		hasLink: Boolean(item.hasLink ?? item.has_link ?? item.hasKind ?? item.has_kind ?? false),
		link: item.link != null ? String(item.link) : (item.Link != null ? String(item.Link) : (item.kind != null ? String(item.kind) : item.Kind != null ? String(item.Kind) : undefined)),
	};
}

export default function ComponentTypeEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const ctId = id ? Number(id) : NaN;

	const { data: rawData, isLoading, isError } = useComponentTypeById(ctId);
	const updateComponentType = useUpdateComponentType();
	const ct = rawData ? normalizeComponentType(rawData) : null;

	const [type, setType] = useState("");
	const [hasTitle, setHasTitle] = useState(false);
	const [hasExcerpt, setHasExcerpt] = useState(false);
	const [hasDescription, setHasDescription] = useState(false);
	const [hasImage, setHasImage] = useState(false);
	const [hasValue, setHasValue] = useState(false);
	const [hasAsset, setHasAsset] = useState(false);
	const [hasLink, setHasLink] = useState(false);
	const [link, setLink] = useState("");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const lastSyncedId = useRef<number | null>(null);

	useEffect(() => {
		if (ct && lastSyncedId.current !== ct.id) {
			lastSyncedId.current = ct.id;
			setType(ct.type ?? "");
			setHasTitle(ct.hasTitle ?? false);
			setHasExcerpt(ct.hasExcerpt ?? false);
			setHasDescription(ct.hasDescription ?? false);
			setHasImage(ct.hasImage ?? false);
			setHasValue(ct.hasValue ?? false);
			setHasAsset(ct.hasAsset ?? false);
			setHasLink(ct.hasLink ?? false);
			setLink(ct.link ?? "");
			setPhotoFile(null);
			setPhotoPreview(ct.photo ? getPhotoUrl(ct.photo) : null);
		}
	}, [ct]);

	const handleToggle = useCallback((key: keyof Pick<ComponentTypeResponse, "hasTitle" | "hasExcerpt" | "hasDescription" | "hasImage" | "hasValue" | "hasAsset" | "hasLink">, value: boolean) => {
		switch (key) {
			case "hasTitle": setHasTitle(value); break;
			case "hasExcerpt": setHasExcerpt(value); break;
			case "hasDescription": setHasDescription(value); break;
			case "hasImage": setHasImage(value); break;
			case "hasValue": setHasValue(value); break;
			case "hasAsset": setHasAsset(value); break;
			case "hasLink": setHasLink(value); break;
		}
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPhotoFile(file);
			setPhotoPreview(URL.createObjectURL(file));
		} else {
			setPhotoFile(null);
			if (photoPreview && !ct?.photo) URL.revokeObjectURL(photoPreview);
			setPhotoPreview(ct?.photo ? getPhotoUrl(ct.photo) : null);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(ctId) || !ct) return;
		const photoPayload: File | string = photoFile ?? (ct.photo ?? "");
		const payload = {
			type: type.trim() || "component",
			hasTitle,
			hasExcerpt,
			hasDescription,
			hasImage,
			hasValue,
			hasAsset,
			photo: photoPayload,
			hasLink,
			...(hasLink && link.trim() && { link: link.trim() }),
		};
		updateComponentType.mutate(
			{ id: ctId, request: payload },
			{ onSuccess: () => navigate(`/component-types/${ctId}`) }
		);
	};

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

	if (isLoading || !ct) {
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
						<Link to={`/component-types/${ct.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Layout className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Bileşen tipi düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {ct.id} — bilgileri güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bileşen tipi bilgileri</CardTitle>
					<CardDescription>
						Tip, fotoğraf ve alan ayarlarını güncelleyin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4">
							<Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
								<Type className="size-4 text-muted-foreground" />
								Tip
							</Label>
							<Input
								id="type"
								value={type}
								onChange={(e) => setType(e.target.value)}
								placeholder="Örn: hero-banner, card, feature"
								required
							/>
						</div>

						<div className="space-y-4">
							<Label className="flex items-center gap-2 text-sm font-medium">
								<Upload className="size-4 text-muted-foreground" />
								Fotoğraf (değiştirmek için yeni seçin)
							</Label>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 cursor-pointer hover:border-brand-ring hover:bg-brand-muted transition-colors min-h-[140px]"
							>
								{photoPreview ? (
									<>
										<img
											src={photoPreview}
											alt="Önizleme"
											className="max-h-24 w-auto object-contain rounded border border-border/60"
										/>
										<p className="text-sm text-muted-foreground">
											{photoFile ? "Yeni fotoğraf seçildi." : "Değiştirmek için tıklayın."}
										</p>
									</>
								) : (
									<>
										<ImageIcon className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Fotoğraf yüklemek için tıklayın
										</p>
									</>
								)}
							</div>
						</div>

						<div className="space-y-4 border-t border-border/60 pt-6">
							<div>
								<h3 className="text-sm font-semibold">Desteklenecek alanlar</h3>
								<p className="text-xs text-muted-foreground mt-0.5">
									Bu bileşen tipinde hangi alanların kullanılacağını belirleyin
								</p>
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								{[
									{ key: "hasTitle" as const, label: "Başlık", icon: FileText, style: "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10", activeStyle: "ring-2 ring-blue-500/50", iconStyle: "text-blue-600 dark:text-blue-400" },
									{ key: "hasExcerpt" as const, label: "Özet", icon: FileText, style: "border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10", activeStyle: "ring-2 ring-purple-500/50", iconStyle: "text-purple-600 dark:text-purple-400" },
									{ key: "hasDescription" as const, label: "Açıklama", icon: FileText, style: "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10", activeStyle: "ring-2 ring-amber-500/50", iconStyle: "text-amber-600 dark:text-amber-400" },
									{ key: "hasImage" as const, label: "Görsel", icon: Image, style: "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10", activeStyle: "ring-2 ring-emerald-500/50", iconStyle: "text-emerald-600 dark:text-emerald-400" },
									{ key: "hasValue" as const, label: "Değer", icon: Hash, style: "border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10", activeStyle: "ring-2 ring-cyan-500/50", iconStyle: "text-cyan-600 dark:text-cyan-400" },
									{ key: "hasAsset" as const, label: "Medya", icon: FileImage, style: "border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10", activeStyle: "ring-2 ring-violet-500/50", iconStyle: "text-violet-600 dark:text-violet-400" },
									{ key: "hasLink" as const, label: "Link", icon: Link2, style: "border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10", activeStyle: "ring-2 ring-rose-500/50", iconStyle: "text-rose-600 dark:text-rose-400" },
								].map(({ key, label, icon: Icon, style, activeStyle, iconStyle }) => {
									const isChecked = key === "hasTitle" ? hasTitle : key === "hasExcerpt" ? hasExcerpt : key === "hasDescription" ? hasDescription : key === "hasImage" ? hasImage : key === "hasValue" ? hasValue : key === "hasAsset" ? hasAsset : hasLink;
									return (
										<div key={key} className="space-y-2">
											<div
												className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${style} ${isChecked ? activeStyle : ""}`}
											>
												<div className="flex min-w-0 flex-1 items-center gap-3">
													<div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isChecked ? "bg-white/80 dark:bg-black/20" : ""}`}>
														<Icon className={`size-4 shrink-0 ${iconStyle}`} />
													</div>
													<div className="min-w-0">
														<span className="text-sm font-medium">{label}</span>
														{isChecked && (
															<span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
																<Check className="size-3" />
																Aktif
															</span>
														)}
													</div>
												</div>
												<Switch
													checked={isChecked}
													onCheckedChange={(checked) => handleToggle(key, checked)}
													className="shrink-0 data-[state=checked]:bg-emerald-600"
												/>
											</div>
											{key === "hasLink" && isChecked && (
												<div className="rounded-xl border-2 border-rose-500/30 bg-rose-500/5 px-4 py-3">
													<Label htmlFor="kind-link" className="flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400 mb-2">
														<Link2 className="size-3.5" />
														Link (URL)
													</Label>
													<Input
														id="kind-link"
														type="url"
														value={link}
														onChange={(e) => setLink(e.target.value)}
														placeholder="https://..."
														className="h-9 text-sm"
													/>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
							<Button
								type="submit"
								disabled={updateComponentType.isPending || !type.trim()}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updateComponentType.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Layout className="size-4" />
								)}
								{updateComponentType.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/component-types/${ct.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
