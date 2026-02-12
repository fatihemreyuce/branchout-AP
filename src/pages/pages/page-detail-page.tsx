import { Link, useParams, useNavigate } from "react-router-dom";
import {
	FileText,
	ArrowLeft,
	Pencil,
	Type,
	Hash,
	Globe,
	Puzzle,
	UserRound,
	Calendar,
	Link2,
	ExternalLink,
} from "lucide-react";
import { usePageById } from "@/hooks/use-page";
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
import type { PageResponse, localizations, fileAssetLocalizations, imageAssetLocalizations } from "@/types/page.types";
import type { ComponentResponse } from "@/types/components.types";
import type { TeamMemberResponse } from "@/types/team.members.types";

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function normalizePage(data: unknown): PageResponse | null {
	if (!data || typeof data !== "object") return null;
	const item = data as Record<string, unknown>;
	const typeVal = item.type;
	const typeObj = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal)
		? (typeVal as Record<string, unknown>) : {};
	const rawComponents = Array.isArray(item.components) ? item.components : [];
	const rawTeamMembers = Array.isArray(item.teamMembers ?? item.team_members) ? (item.teamMembers ?? item.team_members) : [];
	// API bazen { component: {...}, sortOrder } veya doğrudan component objesi döner; sortOrder sayfa içi sıra
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

export default function PageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const pageId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = usePageById(pageId);
	const raw = rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawItem =
		raw != null && (raw.data !== undefined || raw.content !== undefined)
			? (raw.data ?? raw.content)
			: rawData;
	const page = rawItem != null ? normalizePage(rawItem) : null;

	const getTypeName = () => {
		if (!page?.type) return "—";
		if (typeof page.type === "string") return page.type;
		const t = page.type as Record<string, unknown>;
		return String(t.type ?? t.Type ?? "—");
	};

	if (!id || Number.isNaN(pageId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz sayfa ID.</p>
				<Button variant="outline" onClick={() => navigate("/pages")}>
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

	if (isError || !page) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Sayfa bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/pages")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	const fileAsset = page.file as { id?: number; url?: string; type?: string; mime?: string; width?: number | null; height?: number | null; localizations?: fileAssetLocalizations[] } | undefined;
	const imageAsset = page.image as { id?: number; url?: string; type?: string; mime?: string; width?: number | null; height?: number | null; localizations?: imageAssetLocalizations[] } | undefined;
	const fileLocs = fileAsset?.localizations ?? [];
	const imageLocs = imageAsset?.localizations ?? [];

	const cardClass = "overflow-hidden rounded-xl border-2 border-border bg-card shadow-md dark:shadow-none";
	const cardHeaderClass = "border-b-2 border-border bg-muted/50 dark:bg-muted/30 px-6 py-4";
	const blockClass = "rounded-lg border-2 border-border bg-muted/30 dark:bg-muted/20 p-4";

	return (
		<div className="space-y-8 pb-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/pages">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring relative overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<FileText className="size-7 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{page.name || `Sayfa #${page.id}`}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {page.id} · {getTypeName()} · Sayfa detayı
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/pages/${page.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className={cardClass}>
					<CardHeader className={cardHeaderClass}>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<span className="flex size-9 items-center justify-center rounded-lg bg-brand/15 text-brand shadow-sm">
								<Hash className="size-4" />
							</span>
							Temel bilgiler
						</CardTitle>
						<CardDescription className="text-sm">Sayfa kimlik ve tip bilgileri</CardDescription>
					</CardHeader>
					<CardContent className="p-6 bg-background/50 dark:bg-transparent">
						<dl className="space-y-4">
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</dt>
								<dd className="mt-1 font-mono text-sm font-medium">{page.id}</dd>
							</div>
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ad</dt>
								<dd className="mt-1 text-sm font-medium">{page.name || "—"}</dd>
							</div>
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slug</dt>
								<dd className="mt-1 font-mono text-sm">{page.slug || "—"}</dd>
							</div>
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tip</dt>
								<dd className="mt-1 text-sm">{getTypeName()}</dd>
							</div>
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">typeId</dt>
								<dd className="mt-1 font-mono text-sm">{page.typeId ?? "—"}</dd>
							</div>
							{(page.createdAt || page.updatedAt) && (
								<div>
									<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
										<Calendar className="size-3" /> Tarihler
									</dt>
									<dd className="mt-1 text-xs text-muted-foreground">
										{page.createdAt && <span>Oluşturulma: {new Date(page.createdAt).toLocaleString("tr-TR")}</span>}
										{page.createdAt && page.updatedAt && " · "}
										{page.updatedAt && <span>Güncelleme: {new Date(page.updatedAt).toLocaleString("tr-TR")}</span>}
									</dd>
								</div>
							)}
						</dl>
					</CardContent>
				</Card>

				<Card className={cardClass}>
					<CardHeader className={cardHeaderClass}>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 shadow-sm">
								<Type className="size-4" />
							</span>
							Medyalar
						</CardTitle>
						<CardDescription className="text-sm">Dosya ve görsel medyaları</CardDescription>
					</CardHeader>
					<CardContent className="p-6 bg-background/50 dark:bg-transparent">
						<div className="space-y-6">
							{fileAsset?.url ? (
								<div className={`space-y-3 ${blockClass}`}>
									<p className="text-sm font-semibold text-foreground">Dosya medyası</p>
									{(fileAsset.id != null || fileAsset.type || fileAsset.mime || fileAsset.width != null || fileAsset.height != null) && (
										<p className="text-xs text-muted-foreground">
											{[
												fileAsset.id != null && `ID: ${fileAsset.id}`,
												fileAsset.type && `type: ${fileAsset.type}`,
												fileAsset.mime && `mime: ${fileAsset.mime}`,
												(fileAsset.width != null || fileAsset.height != null) && `width: ${fileAsset.width ?? "—"} × height: ${fileAsset.height ?? "—"}`,
											].filter(Boolean).join(" · ")}
										</p>
									)}
									<a
										href={getAssetUrl(fileAsset.url)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-brand hover:underline"
									>
										Dosyayı aç
									</a>
									{fileLocs.length > 0 && (
										<div className="space-y-2 pt-3 mt-3 border-t-2 border-border">
											<p className="text-xs font-medium text-muted-foreground">Dil bazlı metinler</p>
											{fileLocs.map((loc, idx) => (
												<div key={idx} className="rounded-lg border-2 border-border bg-background dark:bg-muted/20 p-3 space-y-1.5">
													<Badge variant="secondary" className="text-xs">Dil: {loc.languageCode}</Badge>
													{loc.title && <p className="font-medium text-sm">{loc.title}</p>}
													{loc.description && <p className="text-sm text-muted-foreground">{loc.description}</p>}
													{loc.subdescription && <p className="text-xs text-muted-foreground">{loc.subdescription}</p>}
												</div>
											))}
										</div>
									)}
								</div>
							) : (
								<div className={blockClass}><p className="text-sm text-muted-foreground">Dosya medyası eklenmemiş</p></div>
							)}
							{imageAsset?.url ? (
								<div className={`space-y-3 ${blockClass}`}>
									<p className="text-sm font-semibold text-foreground">Görsel medyası</p>
									{(imageAsset.id != null || imageAsset.type || imageAsset.mime || imageAsset.width != null || imageAsset.height != null) && (
										<p className="text-xs text-muted-foreground">
											{[
												imageAsset.id != null && `ID: ${imageAsset.id}`,
												imageAsset.type && `type: ${imageAsset.type}`,
												imageAsset.mime && `mime: ${imageAsset.mime}`,
												(imageAsset.width != null || imageAsset.height != null) && `${imageAsset.width ?? "—"}×${imageAsset.height ?? "—"}`,
											].filter(Boolean).join(" · ")}
										</p>
									)}
									<img
										src={getAssetUrl(imageAsset.url)}
										alt={imageLocs[0]?.title || "Sayfa görseli"}
										className="max-h-48 rounded-lg border border-border/60 object-contain"
									/>
									{imageLocs.length > 0 && (
										<div className="space-y-2 pt-3 mt-3 border-t-2 border-border">
											<p className="text-xs font-medium text-muted-foreground">Dil bazlı metinler</p>
											{imageLocs.map((loc, idx) => (
												<div key={idx} className="rounded-lg border-2 border-border bg-background dark:bg-muted/20 p-3 space-y-1.5">
													<Badge variant="secondary" className="text-xs">Dil: {loc.languageCode}</Badge>
													{loc.title && <p className="font-medium text-sm">{loc.title}</p>}
													{loc.description && <p className="text-sm text-muted-foreground">{loc.description}</p>}
													{loc.subdescription && <p className="text-xs text-muted-foreground">{loc.subdescription}</p>}
												</div>
											))}
										</div>
									)}
								</div>
							) : (
								<div className={blockClass}><p className="text-sm text-muted-foreground">Görsel medyası eklenmemiş</p></div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{page.localizations && page.localizations.length > 0 && (
				<Card className={cardClass}>
					<CardHeader className={cardHeaderClass}>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm">
								<Globe className="size-4" />
							</span>
							Sayfa içerikleri (dil bazlı)
						</CardTitle>
						<CardDescription className="text-sm">Her dil için başlık, özet ve SEO alanları</CardDescription>
					</CardHeader>
					<CardContent className="p-6 bg-background/50 dark:bg-transparent">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{page.localizations.map((loc, idx) => (
								<div key={idx} className="rounded-xl border-2 border-border bg-muted/30 dark:bg-muted/20 p-4 space-y-3">
									<Badge variant="secondary" className="text-xs">Dil: {loc.languageCode}</Badge>
									{loc.title && <p className="font-semibold text-sm">{loc.title}</p>}
									{loc.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{loc.excerpt}</p>}
									{loc.content && <p className="text-xs text-muted-foreground line-clamp-3">{loc.content}</p>}
									{(loc.metaTitle || loc.metaDescription || loc.metaKeywords) && (
										<div className="pt-3 mt-2 border-t-2 border-border space-y-1">
											<p className="text-xs font-semibold text-muted-foreground">SEO (Meta)</p>
											{loc.metaTitle && <p className="text-xs"><span className="text-muted-foreground">Başlık:</span> {loc.metaTitle}</p>}
											{loc.metaDescription && <p className="text-xs"><span className="text-muted-foreground">Açıklama:</span> {loc.metaDescription}</p>}
											{loc.metaKeywords && <p className="text-xs"><span className="text-muted-foreground">Anahtar kelimeler:</span> {loc.metaKeywords}</p>}
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className={cardClass}>
					<CardHeader className={cardHeaderClass}>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-sm">
								<Puzzle className="size-4" />
							</span>
							Bileşenler ({page.components?.length ?? 0})
						</CardTitle>
						<CardDescription className="text-sm">Sayfaya bağlı bileşenler</CardDescription>
					</CardHeader>
					<CardContent className="p-6 bg-background/50 dark:bg-transparent">
						{page.components && page.components.length > 0 ? (
							<div className="space-y-4">
								{[...page.components]
									.sort((a, b) => ((a as { _pageSortOrder?: number })._pageSortOrder ?? 0) - ((b as { _pageSortOrder?: number })._pageSortOrder ?? 0))
									.map((c) => {
										const t = c.type as Record<string, unknown> | string | undefined;
										const typeLabel = typeof t === "string" ? t : (t?.type ?? t?.Type);
										const compLocs = c.localizations ?? [];
										const compAssets = Array.isArray(c.assets) ? c.assets : [];
										return (
										<div key={c.id} className={`rounded-xl border-2 border-border overflow-hidden shadow-sm ${blockClass}`}>
											<Link to={`/components/${c.id}`} className="flex items-center gap-3 p-3 -m-4 mb-0 rounded-t-lg hover:bg-muted/40 transition-colors">
												<div className="flex size-11 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
													<Puzzle className="size-5 text-amber-600 dark:text-amber-400" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-semibold text-sm">{c.name || `#${c.id}`}</p>
													{typeLabel && <p className="text-xs text-muted-foreground">{String(typeLabel)}</p>}
													{typeof (c as { _pageSortOrder?: number })._pageSortOrder === "number" && (
														<p className="text-xs text-muted-foreground">Sıra: {(c as { _pageSortOrder: number })._pageSortOrder}</p>
													)}
												</div>
											</Link>
											<div className="space-y-3 pt-3 mt-3 border-t-2 border-border">
												{(c.value != null && c.value !== "") && <p className="text-sm"><span className="text-muted-foreground font-medium">Değer:</span> {String(c.value)}</p>}
												{c.link && (
													<a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline flex items-center gap-1.5 font-medium">
														<Link2 className="size-4 shrink-0" /> Bağlantı
													</a>
												)}
												{compLocs.length > 0 && (
													<div className="space-y-2">
														<p className="text-xs font-semibold text-muted-foreground">Dil bazlı metinler</p>
														{compLocs.map((loc: { languageCode?: string; title?: string; excerpt?: string; description?: string }, i: number) => (
															<div key={i} className="rounded-lg border-2 border-border bg-background dark:bg-muted/20 p-2.5 text-xs">
																<Badge variant="secondary" className="text-[10px]">Dil: {loc.languageCode}</Badge>
																{loc.title && <p className="font-medium mt-1">{loc.title}</p>}
																{loc.excerpt && <p className="text-muted-foreground">{loc.excerpt}</p>}
																{loc.description && <p className="text-muted-foreground">{loc.description}</p>}
															</div>
														))}
													</div>
												)}
												{compAssets.length > 0 && (
													<div className="space-y-2">
														<p className="text-xs font-semibold text-muted-foreground">Medya (assets)</p>
														{compAssets.map((ag: { id?: number; sortOrder?: number; asset?: { id?: number; url?: string; type?: string; localizations?: unknown[] } }, i: number) => {
															const asset = Array.isArray(ag.asset) ? ag.asset[0] : ag.asset;
															const a = asset && typeof asset === "object" ? asset as { id?: number; url?: string; type?: string; localizations?: { languageCode?: string; title?: string; description?: string; subdescription?: string }[] } : null;
															return (
																<div key={ag.id ?? i} className="rounded-lg border-2 border-border bg-background dark:bg-muted/20 p-2.5 text-xs flex flex-wrap gap-2 items-start">
																	{ag.sortOrder != null && <Badge variant="outline" className="text-[10px]">Sıra: {ag.sortOrder}</Badge>}
																	{a?.url && <a href={getAssetUrl(a.url)} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline truncate max-w-[220px] font-medium">{a.type ?? "Medya"} #{a.id ?? ""}</a>}
																	{a?.localizations?.length ? (
																		<div className="w-full mt-1 space-y-0.5">
																			{a.localizations.map((al: { languageCode?: string; title?: string; description?: string; subdescription?: string }, j: number) => (
																				<div key={j} className="flex gap-1.5 items-baseline"><Badge variant="outline" className="text-[10px]">{al.languageCode}</Badge> <span className="text-muted-foreground">{al.title || al.description || al.subdescription || "—"}</span></div>
																			))}
																		</div>
																	) : null}
																</div>
															);
														})}
													</div>
												)}
											</div>
										</div>
									);})}
							</div>
						) : (
							<div className={blockClass}><p className="text-sm text-muted-foreground text-center py-6">Henüz bileşen eklenmedi</p></div>
						)}
					</CardContent>
				</Card>

				<Card className={cardClass}>
					<CardHeader className={cardHeaderClass}>
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm">
								<UserRound className="size-4" />
							</span>
							Takım üyeleri ({page.teamMembers?.length ?? 0})
						</CardTitle>
						<CardDescription className="text-sm">Sayfaya atanan takım üyeleri</CardDescription>
					</CardHeader>
					<CardContent className="p-6 bg-background/50 dark:bg-transparent">
						{page.teamMembers && page.teamMembers.length > 0 ? (
							<div className="space-y-4">
								{[...page.teamMembers]
									.sort((a, b) => ((a as { _pageSortOrder?: number })._pageSortOrder ?? (a as TeamMemberResponse).sortOrder ?? 0) - ((b as { _pageSortOrder?: number })._pageSortOrder ?? (b as TeamMemberResponse).sortOrder ?? 0))
									.map((tm) => {
										const so = (tm as { _pageSortOrder?: number })._pageSortOrder ?? (tm as TeamMemberResponse).sortOrder;
										const tmLocs = tm.localizations ?? [];
										return (
										<div key={tm.id} className={`rounded-xl border-2 border-border overflow-hidden shadow-sm ${blockClass}`}>
											<Link to={`/team-members/${tm.id}`} className="flex items-center gap-3 p-3 -m-4 mb-0 rounded-t-lg hover:bg-muted/40 transition-colors">
												{tm.photo ? (
													<img src={getAssetUrl(tm.photo)} alt={tm.name} className="size-12 rounded-full object-cover border-2 border-border shadow-sm" />
												) : (
													<div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-border">
														<UserRound className="size-6 text-emerald-600 dark:text-emerald-400" />
													</div>
												)}
												<div className="min-w-0 flex-1">
													<p className="font-semibold text-sm">{tm.name}</p>
													<p className="text-xs text-muted-foreground">{tm.email}</p>
													{typeof so === "number" && <p className="text-xs text-muted-foreground">Sıra: {so}</p>}
												</div>
											</Link>
											<div className="space-y-3 pt-3 mt-3 border-t-2 border-border">
												{tm.linkedinUrl && (
													<a href={tm.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline flex items-center gap-1.5 font-medium">
														<ExternalLink className="size-4 shrink-0" /> LinkedIn profilini aç
													</a>
												)}
												{tmLocs.length > 0 && (
													<div className="space-y-2">
														<p className="text-xs font-semibold text-muted-foreground">Dil bazlı metinler</p>
														{tmLocs.map((loc: { languageCode?: string; title?: string; description?: string }, i: number) => (
															<div key={i} className="rounded-lg border-2 border-border bg-background dark:bg-muted/20 p-2.5 text-xs">
																<Badge variant="secondary" className="text-[10px]">Dil: {loc.languageCode}</Badge>
																{loc.title && <p className="font-medium mt-1">{loc.title}</p>}
																{loc.description && <p className="text-muted-foreground">{loc.description}</p>}
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									);})}
							</div>
						) : (
							<div className={blockClass}><p className="text-sm text-muted-foreground text-center py-6">Henüz takım üyesi eklenmedi</p></div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
