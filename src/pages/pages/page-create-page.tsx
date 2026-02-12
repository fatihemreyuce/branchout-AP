import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FileText,
	ArrowLeft,
	Loader2,
	Type,
	Globe,
	Puzzle,
	UserRound,
	CheckCircle2,
	ChevronRight,
	ChevronLeft,
	Languages,
} from "lucide-react";
import { translateFromTurkish } from "@/utils/translate";
import { useCreatePage, useAddComponentToPage, useAddTeamMemberToPage } from "@/hooks/use-page";
import { usePageTypes } from "@/hooks/use-page-type";
import { useComponentTypes } from "@/hooks/use-component-type";
import { useComponents } from "@/hooks/use-components";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type {
	PageRequest,
	localizations,
	fileAssetLocalizations,
	imageAssetLocalizations,
} from "@/types/page.types";
import type { ComponentResponse } from "@/types/components.types";
import type { ComponentTypeResponse } from "@/types/components.type.types";
import type { TeamMemberResponse } from "@/types/team.members.types";

/** API'den gelen bileşen listesini normalize eder; tip adı (type.type) her zaman dolu olur. */
function normalizeComponentFromList(x: unknown): ComponentResponse {
	const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
	const typeVal = item.type;
	const isTypeObject = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal);
	const typeObj = isTypeObject ? (typeVal as Record<string, unknown>) : {};
	const typeId = Number(item.typeId ?? item.type_id ?? typeObj?.id ?? typeObj?.Id ?? 0);
	const typeName = typeof typeVal === "string" ? typeVal : String(typeObj.type ?? typeObj.Type ?? "");
	const typeForDisplay: ComponentTypeResponse = {
		id: typeId,
		type: typeName,
		hasTitle: false,
		hasExcerpt: false,
		hasDescription: false,
		hasImage: false,
		hasValue: false,
		hasAsset: false,
		photo: "",
		hasLink: false,
	};
	return {
		id: Number(item.id ?? item.Id ?? 0),
		name: String(item.name ?? item.Name ?? ""),
		typeId: typeId || 0,
		type: typeForDisplay,
		value: String(item.value ?? item.Value ?? ""),
		link: String(item.link ?? item.Link ?? ""),
		localizations: Array.isArray(item.localizations) ? (item.localizations as ComponentResponse["localizations"]) : [],
		assets: Array.isArray(item.assets) ? (item.assets as ComponentResponse["assets"]) : [],
	};
}

const STEPS = [
	{ id: 1, label: "Sayfa Belirle", icon: FileText },
	{ id: 2, label: "Bileşen", icon: Puzzle },
	{ id: 3, label: "Takım Üyesi", icon: UserRound },
	{ id: 4, label: "Özet", icon: CheckCircle2 },
	{ id: 5, label: "Bitir", icon: CheckCircle2 },
];

function emptyFileLoc(): fileAssetLocalizations {
	return { languageCode: "", title: "", description: "", subdescription: "" };
}
function emptyImgLoc(): imageAssetLocalizations {
	return { languageCode: "", title: "", description: "", subdescription: "" };
}
function emptyLoc(): localizations {
	return {
		languageCode: "",
		title: "",
		excerpt: "",
		content: "",
		metaTitle: "",
		metaDescription: "",
		metaKeywords: "",
	};
}

export default function PageCreatePage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [createdPageId, setCreatedPageId] = useState<number | null>(null);

	// Step 1: Page info
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [typeId, setTypeId] = useState<number | "">("");
	const [fileAsset, setFileAsset] = useState<File | "">("");
	const [imageAsset, setImageAsset] = useState<File | "">("");
	const [localizations, setLocalizations] = useState<localizations[]>([emptyLoc()]);
	const [fileAssetLocalizations, setFileAssetLocalizations] = useState<fileAssetLocalizations[]>([emptyFileLoc()]);
	const [imageAssetLocalizations, setImageAssetLocalizations] = useState<imageAssetLocalizations[]>([emptyImgLoc()]);

	// Step 2 & 3: Selected items
	const [selectedComponentIds, setSelectedComponentIds] = useState<Set<number>>(new Set());
	const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<Set<number>>(new Set());
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);
	const [translatingFileIdx, setTranslatingFileIdx] = useState<number | null>(null);
	const [translatingImageIdx, setTranslatingImageIdx] = useState<number | null>(null);

	const createPage = useCreatePage();
	const addComponentToPage = useAddComponentToPage();
	const addTeamMemberToPage = useAddTeamMemberToPage();

	const { data: typesData } = usePageTypes("", 0, 100, "type,asc");
	const { data: componentTypesData } = useComponentTypes("", 0, 100, "type,asc");
	const { data: componentsData } = useComponents("", 0, 100, "id,asc");
	const { data: teamMembersData } = useTeamMembers("", 0, 100, "id,asc");
	const { data: languagesData } = useLanguages(0, 100, "id,asc");

	const pageTypes = useMemo(() => {
		const raw = typesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		return Array.isArray(arr) ? arr.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			type: String(x.type ?? x.Type ?? ""),
		})) : [];
	}, [typesData]);

	const componentTypesList = useMemo(() => {
		const raw = componentTypesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		if (!Array.isArray(arr)) return [];
		return arr.map((t: Record<string, unknown>) => ({
			id: Number(t.id ?? t.Id ?? 0),
			type: String(t.type ?? t.Type ?? ""),
		}));
	}, [componentTypesData]);

	const components = useMemo(() => {
		const raw = componentsData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		if (!Array.isArray(arr)) return [];
		return arr.map((x: unknown) => {
			const c = normalizeComponentFromList(x);
			if (!c.type?.type && c.typeId && componentTypesList.length > 0) {
				const typeName = componentTypesList.find((t) => t.id === c.typeId)?.type ?? "";
				if (typeName) c.type = { ...c.type, type: typeName };
			}
			return c;
		});
	}, [componentsData, componentTypesList]);

	const teamMembers = useMemo(() => {
		const raw = teamMembersData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		return Array.isArray(arr) ? (arr as TeamMemberResponse[]) : [];
	}, [teamMembersData]);

	const languages = useMemo(() => {
		const raw = languagesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		return Array.isArray(arr) ? arr.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			code: String(x.code ?? x.Code ?? ""),
		})) : [];
	}, [languagesData]);

	// Sayfa adı yazılırken slug aynı anda otomatik güncellenir
	useEffect(() => {
		const slugified = name
			.trim()
			.toLowerCase()
			.replace(/ğ/g, "g")
			.replace(/ü/g, "u")
			.replace(/ş/g, "s")
			.replace(/ı/g, "i")
			.replace(/ö/g, "o")
			.replace(/ç/g, "c")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		setSlug(slugified);
	}, [name]);

	const updateLocalization = (idx: number, field: keyof localizations, val: string) => {
		setLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: val } : loc))
		);
	};
	const addLocalization = () => {
		setLocalizations((prev) => [...prev, emptyLoc()]);
	};
	const removeLocalization = (idx: number) => {
		setLocalizations((prev) => prev.filter((_, i) => i !== idx));
	};

	const updateFileAssetLoc = (idx: number, field: keyof fileAssetLocalizations, val: string) => {
		setFileAssetLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: val } : loc))
		);
	};
	const addFileAssetLoc = () => setFileAssetLocalizations((prev) => [...prev, emptyFileLoc()]);
	const removeFileAssetLoc = (idx: number) => setFileAssetLocalizations((prev) => prev.filter((_, i) => i !== idx));

	const updateImageAssetLoc = (idx: number, field: keyof imageAssetLocalizations, val: string) => {
		setImageAssetLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: val } : loc))
		);
	};
	const addImageAssetLoc = () => setImageAssetLocalizations((prev) => [...prev, emptyImgLoc()]);
	const removeImageAssetLoc = (idx: number) => setImageAssetLocalizations((prev) => prev.filter((_, i) => i !== idx));

	// Dosya medyası lokalizasyonlarını (title, description, subdescription) hedef dile çevirir
	const handleTranslateFileAll = async (idx: number) => {
		const fl = fileAssetLocalizations[idx];
		if (!fl?.languageCode || fl.languageCode.toLowerCase() === "tr") return;
		const hasAny = fl.title?.trim() || fl.description?.trim() || fl.subdescription?.trim();
		if (!hasAny) return;
		setTranslatingFileIdx(idx);
		try {
			const fields = ["title", "description", "subdescription"] as const;
			for (const field of fields) {
				const sourceTr = (fl[field] ?? "").trim();
				if (sourceTr) {
					const translated = await translateFromTurkish(sourceTr, fl.languageCode);
					updateFileAssetLoc(idx, field, translated);
				}
			}
		} finally {
			setTranslatingFileIdx(null);
		}
	};

	// Görsel medyası lokalizasyonlarını (title, description, subdescription) hedef dile çevirir
	const handleTranslateImageAll = async (idx: number) => {
		const il = imageAssetLocalizations[idx];
		if (!il?.languageCode || il.languageCode.toLowerCase() === "tr") return;
		const hasAny = il.title?.trim() || il.description?.trim() || il.subdescription?.trim();
		if (!hasAny) return;
		setTranslatingImageIdx(idx);
		try {
			const fields = ["title", "description", "subdescription"] as const;
			for (const field of fields) {
				const sourceTr = (il[field] ?? "").trim();
				if (sourceTr) {
					const translated = await translateFromTurkish(sourceTr, il.languageCode);
					updateImageAssetLoc(idx, field, translated);
				}
			}
		} finally {
			setTranslatingImageIdx(null);
		}
	};

	// Tek butonla tüm alanları (title, excerpt, content) hedef dile çevirir
	const handleTranslateAll = async (idx: number) => {
		const loc = localizations[idx];
		if (!loc?.languageCode || loc.languageCode.toLowerCase() === "tr") return;
		const hasAny = (loc.title?.trim() || loc.excerpt?.trim() || loc.content?.trim());
		if (!hasAny) return;
		setTranslatingIdx(idx);
		try {
			const fields = ["title", "excerpt", "content"] as const;
			for (const field of fields) {
				const sourceTr = (loc[field] ?? "").trim();
				if (sourceTr) {
					const translated = await translateFromTurkish(sourceTr, loc.languageCode);
					updateLocalization(idx, field, translated);
				}
			}
		} finally {
			setTranslatingIdx(null);
		}
	};

	const toggleComponent = (id: number) => {
		setSelectedComponentIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const toggleTeamMember = (id: number) => {
		setSelectedTeamMemberIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// İlerle: Sadece sonraki adıma geçer, API çağrısı yapmaz
	const handleStep1Next = () => {
		if (!typeId || typeId <= 0 || !name.trim() || !slug.trim()) return;
		setStep(2);
	};

	const handleStep2Next = () => setStep(3);
	const handleStep3Next = () => setStep(4);

	// Bitir: Tüm veriyi toplayıp sayfa oluşturur, sonra bileşen/takım üyesi ekler
	const handleBitir = () => {
		if (!typeId || typeId <= 0 || !name.trim() || !slug.trim()) return;
		// Boş languageCode ile gönderilen kayıtlar "Language not found" hatasına yol açar
		const filteredFileLocs = fileAssetLocalizations.filter((l) => l.languageCode?.trim());
		const filteredImgLocs = imageAssetLocalizations.filter((l) => l.languageCode?.trim());
		const payload: PageRequest = {
			slug: slug.trim(),
			name: name.trim(),
			typeId: Number(typeId),
			fileAsset: fileAsset || "",
			fileAssetId: 0,
			fileAssetLocalizations: filteredFileLocs,
			imageAsset: imageAsset || "",
			imageAssetId: 0,
			imageAssetLocalizations: filteredImgLocs,
			localizations: localizations.filter((l) => l.languageCode?.trim()),
		};
		createPage.mutate(payload, {
			onSuccess: async (res) => {
				const pageId = res.id;
				const comps = components.filter((c) => selectedComponentIds.has(c.id));
				const tms = teamMembers.filter((tm) => selectedTeamMemberIds.has(tm.id));
				for (let i = 0; i < comps.length; i++) {
					const comp = comps[i];
					if (!comp.id || comp.id <= 0) continue;
					await addComponentToPage.mutateAsync({ pageId, componentId: comp.id, sortOrder: i });
				}
				for (let i = 0; i < tms.length; i++) {
					const tm = tms[i];
					if (!tm.id || tm.id <= 0) continue;
					await addTeamMemberToPage.mutateAsync({ pageId, teamMemberId: tm.id, sortOrder: i });
				}
				setCreatedPageId(pageId);
				setStep(5);
			},
		});
	};

	const handleFinish = () => {
		navigate(createdPageId ? `/pages/${createdPageId}` : "/pages");
	};

	const canProceedStep1 = typeId && typeId > 0 && name.trim() && slug.trim();

	return (
		<div className="space-y-8">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild className="shrink-0">
					<Link to="/pages">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<div className="flex items-center gap-3 min-w-0">
					<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
						<BorderBeam size={50} duration={8} />
						<FileText className="size-6 relative z-10" />
					</div>
					<div className="min-w-0">
						<h1 className="text-2xl font-bold tracking-tight truncate">Yeni Sayfa</h1>
						<p className="text-muted-foreground text-sm mt-0.5">Adım adım sayfa oluşturun</p>
					</div>
				</div>
			</div>

			{/* Stepper */}
			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardContent className="p-6">
					<div className="flex items-center justify-between gap-2">
						{STEPS.map((s, idx) => {
							const Icon = s.icon;
							const isActive = step === s.id;
							const isDone = step > s.id;
							return (
								<div key={s.id} className="flex flex-1 items-center">
									<button
										type="button"
										onClick={() => isDone && setStep(s.id)}
										className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
											isActive
												? "bg-brand text-brand-foreground shadow-sm"
												: isDone
													? "bg-brand/10 text-brand hover:bg-brand/20 cursor-pointer"
													: "bg-muted/50 text-muted-foreground cursor-default"
										}`}
									>
										<span className="flex size-8 items-center justify-center rounded-full bg-current/20 text-sm font-bold">
											{isDone ? "✓" : s.id}
										</span>
										<span className="hidden sm:inline text-sm font-medium">{s.label}</span>
									</button>
									{idx < STEPS.length - 1 && (
										<div
											className={`h-0.5 flex-1 mx-1 rounded ${
												isDone ? "bg-brand/50" : "bg-border"
											}`}
										/>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="flex items-center gap-2">
						{STEPS[step - 1] && (
							<>
								<span className="flex size-8 items-center justify-center rounded-lg bg-brand/20 text-brand">
									{step}
								</span>
								{STEPS[step - 1].label}
							</>
						)}
					</CardTitle>
					<CardDescription>
						{step === 1 && "Sayfa adı, slug, tip ve lokalizasyonları belirleyin"}
						{step === 2 && "Sayfaya eklemek istediğiniz bileşenleri seçin"}
						{step === 3 && "Sayfaya eklemek istediğiniz takım üyelerini seçin"}
						{step === 4 && "Oluşturulan sayfa özeti"}
						{step === 5 && "İşlem tamamlandı"}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					{step === 1 && (
						<div className="space-y-6">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>Sayfa adı</Label>
									<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Ana Sayfa" required />
								</div>
								<div className="space-y-2">
									<Label>Slug</Label>
									<Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ana-sayfa" title="Sayfa adına göre otomatik güncellenir, isterseniz düzenleyebilirsiniz" />
								</div>
							</div>
							<div className="space-y-2">
								<Label>Sayfa tipi</Label>
								<Select value={typeId === "" ? "" : String(typeId)} onValueChange={(v) => setTypeId(v ? Number(v) : "")}>
									<SelectTrigger>
										<SelectValue placeholder="Tip seçin" />
									</SelectTrigger>
									<SelectContent>
										{pageTypes.map((pt) => (
											<SelectItem key={pt.id} value={String(pt.id)}>
												{pt.type || `Tip #${pt.id}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="space-y-3">
									<Label>Dosya medyası</Label>
									<Input
										type="file"
										onChange={(e) => setFileAsset(e.target.files?.[0] || "")}
										className="cursor-pointer"
									/>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label className="text-xs text-muted-foreground">Dosya lokalizasyonları</Label>
											<Button type="button" variant="ghost" size="sm" onClick={addFileAssetLoc}>+ Ekle</Button>
										</div>
										{fileAssetLocalizations.map((fl, idx) => (
											<div key={idx} className="rounded border border-border/60 p-3 space-y-2">
												<div className="flex items-center gap-2">
													<Select value={fl.languageCode} onValueChange={(v) => updateFileAssetLoc(idx, "languageCode", v)}>
														<SelectTrigger className="w-[100px]"><SelectValue placeholder="Dil" /></SelectTrigger>
														<SelectContent>
															{languages.map((lang) => (
																<SelectItem key={lang.id} value={lang.code}>{lang.code}</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Button
														type="button"
														variant="secondary"
														size="sm"
														onClick={() => handleTranslateFileAll(idx)}
														disabled={!fl.languageCode || fl.languageCode.toLowerCase() === "tr" || !(fl.title?.trim() || fl.description?.trim() || fl.subdescription?.trim()) || translatingFileIdx === idx}
														className="gap-1.5"
													>
														{translatingFileIdx === idx ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
														Hepsini Çevir
													</Button>
													<Button type="button" variant="ghost" size="icon" onClick={() => removeFileAssetLoc(idx)}>—</Button>
												</div>
												<Input placeholder="Başlık" value={fl.title} onChange={(e) => updateFileAssetLoc(idx, "title", e.target.value)} className="text-sm" />
												<Input placeholder="Açıklama" value={fl.description} onChange={(e) => updateFileAssetLoc(idx, "description", e.target.value)} className="text-sm" />
												<Input placeholder="Alt açıklama" value={fl.subdescription} onChange={(e) => updateFileAssetLoc(idx, "subdescription", e.target.value)} className="text-sm" />
											</div>
										))}
									</div>
								</div>
								<div className="space-y-3">
									<Label>Görsel medyası</Label>
									<Input
										type="file"
										accept="image/*"
										onChange={(e) => setImageAsset(e.target.files?.[0] || "")}
										className="cursor-pointer"
									/>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label className="text-xs text-muted-foreground">Görsel lokalizasyonları</Label>
											<Button type="button" variant="ghost" size="sm" onClick={addImageAssetLoc}>+ Ekle</Button>
										</div>
										{imageAssetLocalizations.map((il, idx) => (
											<div key={idx} className="rounded border border-border/60 p-3 space-y-2">
												<div className="flex items-center gap-2">
													<Select value={il.languageCode} onValueChange={(v) => updateImageAssetLoc(idx, "languageCode", v)}>
														<SelectTrigger className="w-[100px]"><SelectValue placeholder="Dil" /></SelectTrigger>
														<SelectContent>
															{languages.map((lang) => (
																<SelectItem key={lang.id} value={lang.code}>{lang.code}</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Button
														type="button"
														variant="secondary"
														size="sm"
														onClick={() => handleTranslateImageAll(idx)}
														disabled={!il.languageCode || il.languageCode.toLowerCase() === "tr" || !(il.title?.trim() || il.description?.trim() || il.subdescription?.trim()) || translatingImageIdx === idx}
														className="gap-1.5"
													>
														{translatingImageIdx === idx ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
														Hepsini Çevir
													</Button>
													<Button type="button" variant="ghost" size="icon" onClick={() => removeImageAssetLoc(idx)}>—</Button>
												</div>
												<Input placeholder="Başlık" value={il.title} onChange={(e) => updateImageAssetLoc(idx, "title", e.target.value)} className="text-sm" />
												<Input placeholder="Açıklama" value={il.description} onChange={(e) => updateImageAssetLoc(idx, "description", e.target.value)} className="text-sm" />
												<Input placeholder="Alt açıklama" value={il.subdescription} onChange={(e) => updateImageAssetLoc(idx, "subdescription", e.target.value)} className="text-sm" />
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="flex items-center gap-2">
										<Globe className="size-4" /> Lokalizasyonlar
									</Label>
									<Button type="button" variant="outline" size="sm" onClick={addLocalization}>
										+ Ekle
									</Button>
								</div>
								<p className="text-xs text-muted-foreground">
									Türkçe metni girin, hedef dil seçip Çevir ile çeviri yapın
								</p>
								{localizations.map((loc, idx) => (
									<div key={idx} className="rounded-lg border border-border/60 p-4 space-y-3">
										<div className="flex items-center gap-2">
											<Select
												value={loc.languageCode}
												onValueChange={(v) => updateLocalization(idx, "languageCode", v)}
											>
												<SelectTrigger className="w-[120px]">
													<SelectValue placeholder="Dil" />
												</SelectTrigger>
												<SelectContent>
													{languages.map((lang) => (
														<SelectItem key={lang.id} value={lang.code}>
															{lang.code}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												onClick={() => handleTranslateAll(idx)}
												disabled={!loc.languageCode || loc.languageCode.toLowerCase() === "tr" || !(loc.title?.trim() || loc.excerpt?.trim() || loc.content?.trim()) || translatingIdx === idx}
												className="gap-1.5"
											>
												{translatingIdx === idx ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
												Hepsini Çevir
											</Button>
											<Button type="button" variant="ghost" size="icon" onClick={() => removeLocalization(idx)}>
												—
											</Button>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Başlık</Label>
											<Input
												placeholder="Türkçe metin girin, hedef dil seçip Hepsini Çevir ile çevirin"
												value={loc.title}
												onChange={(e) => updateLocalization(idx, "title", e.target.value)}
												className="w-full"
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Özet</Label>
											<Textarea
												placeholder="Türkçe metin girin"
												value={loc.excerpt}
												onChange={(e) => updateLocalization(idx, "excerpt", e.target.value)}
												rows={2}
												className="w-full resize-none"
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">İçerik (content)</Label>
											<Textarea
												placeholder="Sayfa içerik metni"
												value={loc.content}
												onChange={(e) => updateLocalization(idx, "content", e.target.value)}
												rows={3}
												className="w-full resize-none"
											/>
										</div>
										<div className="grid gap-3 sm:grid-cols-3">
											<div className="space-y-2">
												<Label className="text-xs">Meta Başlık (metaTitle)</Label>
												<Input
													placeholder="SEO meta başlık"
													value={loc.metaTitle}
													onChange={(e) => updateLocalization(idx, "metaTitle", e.target.value)}
												/>
											</div>
											<div className="space-y-2 sm:col-span-2">
												<Label className="text-xs">Meta Açıklama (metaDescription)</Label>
												<Input
													placeholder="SEO meta açıklama"
													value={loc.metaDescription}
													onChange={(e) => updateLocalization(idx, "metaDescription", e.target.value)}
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Meta Anahtar Kelimeler (metaKeywords)</Label>
											<Input
												placeholder="virgülle ayrılmış anahtar kelimeler"
												value={loc.metaKeywords}
												onChange={(e) => updateLocalization(idx, "metaKeywords", e.target.value)}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							{components.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">Henüz bileşen yok. Bu adımı atlayabilirsiniz.</p>
							) : (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{components.map((c) => {
										const sel = selectedComponentIds.has(c.id);
										return (
											<button
												key={c.id}
												type="button"
												onClick={() => toggleComponent(c.id)}
												className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
													sel ? "border-brand bg-brand/5 ring-2 ring-brand/30" : "border-border/60 hover:border-border"
												}`}
											>
												<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
													<Puzzle className="size-5 text-muted-foreground" />
												</span>
												<div className="min-w-0 flex-1">
													<p className="font-medium truncate">{c.name || `#${c.id}`}</p>
													<p className="text-xs text-muted-foreground">{c.type?.type ?? "—"}</p>
												</div>
												{sel && (
													<span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm">✓</span>
												)}
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4">
							{teamMembers.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">Henüz takım üyesi yok. Bu adımı atlayabilirsiniz.</p>
							) : (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{teamMembers.map((tm) => {
										const sel = selectedTeamMemberIds.has(tm.id);
										return (
											<button
												key={tm.id}
												type="button"
												onClick={() => toggleTeamMember(tm.id)}
												className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
													sel ? "border-brand bg-brand/5 ring-2 ring-brand/30" : "border-border/60 hover:border-border"
												}`}
											>
												<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
													<UserRound className="size-5 text-muted-foreground" />
												</span>
												<div className="min-w-0 flex-1">
													<p className="font-medium truncate">{tm.name}</p>
													<p className="text-xs text-muted-foreground truncate">{tm.email}</p>
												</div>
												{sel && (
													<span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm">✓</span>
												)}
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}

					{step === 4 && (
						<div className="space-y-6">
							<div>
								<h4 className="font-medium mb-2">Sayfa</h4>
								<dl className="grid gap-2 text-sm">
									<dt className="text-muted-foreground">Ad</dt>
									<dd className="font-medium">{name}</dd>
									<dt className="text-muted-foreground">Slug</dt>
									<dd className="font-mono">{slug}</dd>
									<dt className="text-muted-foreground">Tip</dt>
									<dd>{pageTypes.find((pt) => pt.id === typeId)?.type ?? "—"}</dd>
								</dl>
							</div>
							<div>
								<h4 className="font-medium mb-2">Bileşenler</h4>
								<p className="text-sm text-muted-foreground">
									{selectedComponentIds.size} adet seçildi
								</p>
							</div>
							<div>
								<h4 className="font-medium mb-2">Takım üyeleri</h4>
								<p className="text-sm text-muted-foreground">
									{selectedTeamMemberIds.size} adet seçildi
								</p>
							</div>
						</div>
					)}

					{step === 5 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="flex size-16 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
								<CheckCircle2 className="size-8" />
							</div>
							<h3 className="text-lg font-semibold mb-2">Sayfa oluşturuldu</h3>
							<p className="text-muted-foreground text-sm mb-6">
								{name} başarıyla oluşturuldu.
							</p>
							<Button onClick={handleFinish} className="gap-2 bg-brand text-brand-foreground">
								Detaya git
								<ChevronRight className="size-4" />
							</Button>
						</div>
					)}

					{step < 5 && (
						<div className="flex items-center justify-between gap-4 pt-6 border-t border-border/60 mt-6">
							<Button
								variant="outline"
								onClick={() => setStep((s) => Math.max(1, s - 1))}
								disabled={step === 1}
							>
								<ChevronLeft className="size-4 mr-2" />
								Geri
							</Button>
							{step === 1 && (
								<Button onClick={handleStep1Next} disabled={!canProceedStep1}>
									İlerle
									<ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 2 && (
								<Button onClick={handleStep2Next}>
									İlerle
									<ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 3 && (
								<Button onClick={handleStep3Next}>
									İlerle
									<ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 4 && (
								<Button
									onClick={handleBitir}
									disabled={!canProceedStep1 || createPage.isPending}
									className="gap-2 bg-brand text-brand-foreground"
								>
									{createPage.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
									Bitir
									<ChevronRight className="size-4" />
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
