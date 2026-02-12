import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
import {
	usePageById,
	useUpdatePage,
	useAddComponentToPage,
	useAddTeamMemberToPage,
} from "@/hooks/use-page";
import { usePageTypes } from "@/hooks/use-page-type";
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
	PageResponse,
	localizations,
	fileAssetLocalizations,
	imageAssetLocalizations,
} from "@/types/page.types";
import type { ComponentResponse } from "@/types/components.types";
import type { TeamMemberResponse } from "@/types/team.members.types";

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

function normalizePage(data: unknown): PageResponse | null {
	if (!data || typeof data !== "object") return null;
	const item = data as Record<string, unknown>;
	const typeVal = item.type;
	const typeObj = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal)
		? (typeVal as Record<string, unknown>) : {};
	const rawComponents = Array.isArray(item.components) ? item.components : [];
	const rawTeamMembers = Array.isArray(item.teamMembers ?? item.team_members) ? (item.teamMembers ?? item.team_members) : [];
	const components = rawComponents.map((c: unknown, idx: number) => {
		const row = c as Record<string, unknown>;
		const comp = (row.component ?? row) as ComponentResponse & { _pageSortOrder?: number | null };
		comp._pageSortOrder = Number(row.sortOrder ?? row.sort_order ?? idx);
		return comp;
	});
	const teamMembers = rawTeamMembers.map((tm: unknown, idx: number) => {
		const row = tm as Record<string, unknown>;
		const member = (row.teamMember ?? row) as TeamMemberResponse & { _pageSortOrder?: number | null };
		member._pageSortOrder = Number(row.sortOrder ?? row.sort_order ?? (member as Record<string, unknown>).sortOrder ?? idx);
		return member;
	});
	return {
		id: Number(item.id ?? item.Id ?? 0),
		slug: String(item.slug ?? item.Slug ?? ""),
		name: String(item.name ?? item.Name ?? ""),
		typeId: Number(item.typeId ?? item.type_id ?? typeObj?.id ?? 0),
		type: (typeof typeVal === "string" ? { type: typeVal } : typeObj) as PageResponse["type"],
		file: (item.file ?? item.File) as PageResponse["file"],
		image: (item.image ?? item.Image) as PageResponse["image"],
		localizations: Array.isArray(item.localizations) ? (item.localizations as localizations[]) : [],
		components,
		teamMembers,
		createdAt: String(item.createdAt ?? item.created_at ?? ""),
		updatedAt: String(item.updatedAt ?? item.updated_at ?? ""),
	} as PageResponse;
}

export default function PageEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const pageId = id ? Number(id) : NaN;
	const [step, setStep] = useState(1);

	const { data: rawData, isLoading, isError } = usePageById(pageId);
	const updatePage = useUpdatePage();
	const addComponentToPage = useAddComponentToPage();
	const addTeamMemberToPage = useAddTeamMemberToPage();
	const raw = rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawItem =
		raw != null && (raw.data !== undefined || raw.content !== undefined)
			? (raw.data ?? raw.content)
			: rawData;
	const page = rawItem != null ? normalizePage(rawItem) : null;

	// Step 1
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [typeId, setTypeId] = useState<number | "">("");
	const [fileAsset, setFileAsset] = useState<File | "">("");
	const [imageAsset, setImageAsset] = useState<File | "">("");
	const [localizations, setLocalizations] = useState<localizations[]>([emptyLoc()]);
	const [fileAssetLocalizations, setFileAssetLocalizations] = useState<fileAssetLocalizations[]>([emptyFileLoc()]);
	const [imageAssetLocalizations, setImageAssetLocalizations] = useState<imageAssetLocalizations[]>([emptyImgLoc()]);

	// Step 2 & 3
	const [selectedComponentIds, setSelectedComponentIds] = useState<Set<number>>(new Set());
	const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<Set<number>>(new Set());
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);
	const [translatingFileIdx, setTranslatingFileIdx] = useState<number | null>(null);
	const [translatingImageIdx, setTranslatingImageIdx] = useState<number | null>(null);

	const lastSyncedId = useRef<number | null>(null);

	const { data: typesData } = usePageTypes("", 0, 100, "type,asc");
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

	const components = useMemo(() => {
		const raw = componentsData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		return Array.isArray(arr) ? (arr as ComponentResponse[]) : [];
	}, [componentsData]);

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

	// Existing page components/team members (already on page)
	const existingComponentIds = useMemo(
		() => new Set((page?.components ?? []).map((c) => c.id)),
		[page?.components]
	);
	const existingTeamMemberIds = useMemo(
		() => new Set((page?.teamMembers ?? []).map((tm) => tm.id)),
		[page?.teamMembers]
	);

	useEffect(() => {
		if (page && lastSyncedId.current !== page.id) {
			lastSyncedId.current = page.id;
			setName(page.name ?? "");
			setSlug(page.slug ?? "");
			setTypeId(page.typeId ?? "");
			setLocalizations(
				page.localizations?.length ? page.localizations : [emptyLoc()]
			);
			const file = page.file as { localizations?: fileAssetLocalizations[] } | undefined;
			const img = page.image as { localizations?: imageAssetLocalizations[] } | undefined;
			setFileAssetLocalizations(file?.localizations?.length ? file.localizations : [emptyFileLoc()]);
			setImageAssetLocalizations(img?.localizations?.length ? img.localizations : [emptyImgLoc()]);
		}
	}, [page]);

	// Sayfa adı değiştikçe slug aynı anda otomatik güncellenir
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
	const addLocalization = () => setLocalizations((prev) => [...prev, emptyLoc()]);
	const removeLocalization = (idx: number) => setLocalizations((prev) => prev.filter((_, i) => i !== idx));

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
			if (existingComponentIds.has(id)) return prev; // can't remove existing here - use delete
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const toggleTeamMember = (id: number) => {
		setSelectedTeamMemberIds((prev) => {
			const next = new Set(prev);
			if (existingTeamMemberIds.has(id)) return prev;
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleStep1Next = async () => {
		if (!page || !typeId || typeId <= 0 || !name.trim() || !slug.trim()) return;
		const filteredFileLocs = fileAssetLocalizations.filter((l) => l.languageCode?.trim());
		const filteredImgLocs = imageAssetLocalizations.filter((l) => l.languageCode?.trim());
		const payload: PageRequest = {
			slug: slug.trim(),
			name: name.trim(),
			typeId: Number(typeId),
			fileAsset: fileAsset || "",
			fileAssetId: (page.file as { id?: number })?.id ?? 0,
			fileAssetLocalizations: filteredFileLocs,
			imageAsset: imageAsset || "",
			imageAssetId: (page.image as { id?: number })?.id ?? 0,
			imageAssetLocalizations: filteredImgLocs,
			localizations: localizations.filter((l) => l.languageCode?.trim()),
		};
		updatePage.mutate(
			{ id: page.id, page: payload },
			{ onSuccess: () => setStep(2) }
		);
	};

	const handleStep2Next = async () => {
		if (!page) return;
		const toAdd = components.filter((c) => selectedComponentIds.has(c.id) && !existingComponentIds.has(c.id));
		const startOrder = page.components?.length ?? 0;
		for (let i = 0; i < toAdd.length; i++) {
			const comp = toAdd[i];
			if (!comp.id || comp.id <= 0) continue;
			await addComponentToPage.mutateAsync({ pageId: page.id, componentId: comp.id, sortOrder: startOrder + i });
		}
		setStep(3);
	};

	const handleStep3Next = async () => {
		if (!page) return;
		const toAdd = teamMembers.filter((tm) => selectedTeamMemberIds.has(tm.id) && !existingTeamMemberIds.has(tm.id));
		const startOrder = page.teamMembers?.length ?? 0;
		for (let i = 0; i < toAdd.length; i++) {
			const tm = toAdd[i];
			if (!tm.id || tm.id <= 0) continue;
			await addTeamMemberToPage.mutateAsync({ pageId: page.id, teamMemberId: tm.id, sortOrder: startOrder + i });
		}
		setStep(4);
	};

	const handleFinish = () => navigate(`/pages/${page?.id}`);

	const canProceedStep1 = typeId && typeId > 0 && name.trim() && slug.trim();

	if (!id || Number.isNaN(pageId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz sayfa ID.</p>
				<Button variant="outline" onClick={() => navigate("/pages")}>Listeye dön</Button>
			</div>
		);
	}

	if (isLoading || !page) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="h-10 bg-muted animate-pulse rounded-lg" />
							<div className="h-24 bg-muted animate-pulse rounded-lg" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Sayfa bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/pages")}>Listeye dön</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild className="shrink-0">
					<Link to={`/pages/${page.id}`}>
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<div className="flex items-center gap-3 min-w-0">
					<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
						<BorderBeam size={50} duration={8} />
						<FileText className="size-6 relative z-10" />
					</div>
					<div className="min-w-0">
						<h1 className="text-2xl font-bold tracking-tight truncate">Sayfa Düzenle</h1>
						<p className="text-muted-foreground text-sm mt-0.5">{page.name || `Sayfa #${page.id}`} · Bilgileri güncelleyin</p>
					</div>
				</div>
			</div>

			{/* Stepper */}
			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardContent className="p-6">
					<div className="flex items-center justify-between gap-2">
						{STEPS.map((s, idx) => {
							const isActive = step === s.id;
							const isDone = step > s.id;
							return (
								<div key={s.id} className="flex flex-1 items-center">
									<button
										type="button"
										onClick={() => isDone && setStep(s.id)}
										className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
											isActive ? "bg-brand text-brand-foreground shadow-sm" :
											isDone ? "bg-brand/10 text-brand hover:bg-brand/20 cursor-pointer" :
											"bg-muted/50 text-muted-foreground cursor-default"
										}`}
									>
										<span className="flex size-8 items-center justify-center rounded-full bg-current/20 text-sm font-bold">
											{isDone ? "✓" : s.id}
										</span>
										<span className="hidden sm:inline text-sm font-medium">{s.label}</span>
									</button>
									{idx < STEPS.length - 1 && (
										<div className={`h-0.5 flex-1 mx-1 rounded ${isDone ? "bg-brand/50" : "bg-border"}`} />
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
						<span className="flex size-8 items-center justify-center rounded-lg bg-brand/20 text-brand">{step}</span>
						{STEPS[step - 1]?.label}
					</CardTitle>
					<CardDescription>
						{step === 1 && "Sayfa adı, slug, tip ve lokalizasyonları güncelleyin"}
						{step === 2 && "Sayfaya eklemek istediğiniz bileşenleri seçin"}
						{step === 3 && "Sayfaya eklemek istediğiniz takım üyelerini seçin"}
						{step === 4 && "Güncellenen sayfa özeti"}
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
									<Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ana-sayfa" required />
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
											<SelectItem key={pt.id} value={String(pt.id)}>{pt.type || `Tip #${pt.id}`}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="space-y-3">
									<Label>Dosya medyası (değiştirmek için seçin)</Label>
									<Input type="file" onChange={(e) => setFileAsset(e.target.files?.[0] || "")} className="cursor-pointer" />
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
									<Label>Görsel medyası (değiştirmek için seçin)</Label>
									<Input type="file" accept="image/*" onChange={(e) => setImageAsset(e.target.files?.[0] || "")} className="cursor-pointer" />
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
									<Label className="flex items-center gap-2"><Globe className="size-4" /> Lokalizasyonlar</Label>
									<Button type="button" variant="outline" size="sm" onClick={addLocalization}>+ Ekle</Button>
								</div>
								<p className="text-xs text-muted-foreground">
									Türkçe metni girin, hedef dil seçip Çevir ile çeviri yapın
								</p>
								{localizations.map((loc, idx) => (
									<div key={idx} className="rounded-lg border border-border/60 p-4 space-y-3">
										<div className="flex items-center gap-2">
											<Select value={loc.languageCode} onValueChange={(v) => updateLocalization(idx, "languageCode", v)}>
												<SelectTrigger className="w-[120px]"><SelectValue placeholder="Dil" /></SelectTrigger>
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
												onClick={() => handleTranslateAll(idx)}
												disabled={!loc.languageCode || loc.languageCode.toLowerCase() === "tr" || !(loc.title?.trim() || loc.excerpt?.trim() || loc.content?.trim()) || translatingIdx === idx}
												className="gap-1.5"
											>
												{translatingIdx === idx ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
												Hepsini Çevir
											</Button>
											<Button type="button" variant="ghost" size="icon" onClick={() => removeLocalization(idx)}>—</Button>
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
							{existingComponentIds.size > 0 && (
								<p className="text-sm text-muted-foreground mb-4">
									Mevcut bileşenler: {[...(page.components ?? [])]
										.sort((a, b) => ((a as { _pageSortOrder?: number })._pageSortOrder ?? 0) - ((b as { _pageSortOrder?: number })._pageSortOrder ?? 0))
										.map((c) => {
											const so = (c as { _pageSortOrder?: number })._pageSortOrder;
											return so != null ? `${c.name || `#${c.id}`} (Sıra: ${so})` : (c.name || `#${c.id}`);
										}).join(", ")}
								</p>
							)}
							{components.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">Henüz bileşen yok. Bu adımı atlayabilirsiniz.</p>
							) : (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{components
										.filter((c) => !existingComponentIds.has(c.id))
										.map((c) => {
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
													{sel && <span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm">✓</span>}
												</button>
											);
										})}
								</div>
							)}
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4">
							{existingTeamMemberIds.size > 0 && (
								<p className="text-sm text-muted-foreground mb-4">
									Mevcut takım üyeleri: {[...(page.teamMembers ?? [])]
										.sort((a, b) => ((a as { _pageSortOrder?: number })._pageSortOrder ?? (a as TeamMemberResponse).sortOrder ?? 0) - ((b as { _pageSortOrder?: number })._pageSortOrder ?? (b as TeamMemberResponse).sortOrder ?? 0))
										.map((tm) => {
											const so = (tm as { _pageSortOrder?: number })._pageSortOrder ?? (tm as TeamMemberResponse).sortOrder;
											return so != null ? `${tm.name} (Sıra: ${so})` : tm.name;
										}).join(", ")}
								</p>
							)}
							{teamMembers.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">Henüz takım üyesi yok. Bu adımı atlayabilirsiniz.</p>
							) : (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{teamMembers
										.filter((tm) => !existingTeamMemberIds.has(tm.id))
										.map((tm) => {
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
													{sel && <span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm">✓</span>}
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
									<dt className="text-muted-foreground">Ad</dt><dd className="font-medium">{name}</dd>
									<dt className="text-muted-foreground">Slug</dt><dd className="font-mono">{slug}</dd>
									<dt className="text-muted-foreground">Tip</dt><dd>{pageTypes.find((pt) => pt.id === typeId)?.type ?? "—"}</dd>
								</dl>
							</div>
							<div>
								<h4 className="font-medium mb-2">Bileşenler</h4>
								<p className="text-sm text-muted-foreground">
									Mevcut: {existingComponentIds.size} · Eklenecek: {selectedComponentIds.size}
								</p>
							</div>
							<div>
								<h4 className="font-medium mb-2">Takım üyeleri</h4>
								<p className="text-sm text-muted-foreground">
									Mevcut: {existingTeamMemberIds.size} · Eklenecek: {selectedTeamMemberIds.size}
								</p>
							</div>
						</div>
					)}

					{step === 5 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="flex size-16 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
								<CheckCircle2 className="size-8" />
							</div>
							<h3 className="text-lg font-semibold mb-2">Sayfa güncellendi</h3>
							<p className="text-muted-foreground text-sm mb-6">{name} başarıyla güncellendi.</p>
							<Button onClick={handleFinish} className="gap-2 bg-brand text-brand-foreground">
								Detaya git <ChevronRight className="size-4" />
							</Button>
						</div>
					)}

					{step < 5 && (
						<div className="flex items-center justify-between gap-4 pt-6 border-t border-border/60 mt-6">
							<Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
								<ChevronLeft className="size-4 mr-2" /> Geri
							</Button>
							{step === 1 && (
								<Button onClick={handleStep1Next} disabled={!canProceedStep1 || updatePage.isPending}>
									{updatePage.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
									İlerle <ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 2 && (
								<Button onClick={handleStep2Next} disabled={addComponentToPage.isPending}>
									{addComponentToPage.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
									İlerle <ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 3 && (
								<Button onClick={handleStep3Next} disabled={addTeamMemberToPage.isPending}>
									{addTeamMemberToPage.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
									İlerle <ChevronRight className="size-4 ml-2" />
								</Button>
							)}
							{step === 4 && (
								<Button onClick={() => setStep(5)} className="gap-2 bg-brand text-brand-foreground">
									Bitir <ChevronRight className="size-4" />
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
