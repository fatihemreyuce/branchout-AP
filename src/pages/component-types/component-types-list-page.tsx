import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Layout,
	Plus,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
	Search,
	FileImage,
} from "lucide-react";
import { useComponentTypes, useDeleteComponentType } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { ComponentTypeResponse } from "@/types/components.type.types";

const SORT_OPTIONS = [
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
	{ value: "type,asc", label: "Tip (A-Z)" },
	{ value: "type,desc", label: "Tip (Z-A)" },
];

const PAGE_SIZES = [5, 10, 20, 50];

function updateSearchParams(
	prev: URLSearchParams,
	updates: { search?: string; sort?: string; page?: number; size?: number }
): URLSearchParams {
	const next = new URLSearchParams(prev);
	if (updates.search !== undefined) next.set("search", updates.search);
	if (updates.sort !== undefined) next.set("sort", updates.sort);
	if (updates.page !== undefined) {
		if (updates.page === 0) next.delete("page");
		else next.set("page", String(updates.page));
	}
	if (updates.size !== undefined) next.set("size", String(updates.size));
	return next;
}

function getPhotoUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

/** API snake_case dönebilir */
function normalizeList(data: unknown): ComponentTypeResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data ?? [];
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
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
		} satisfies ComponentTypeResponse;
	});
}

export default function ComponentTypesListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<ComponentTypeResponse | null>(null);
	const [searchInput, setSearchInput] = useState(search);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	useEffect(() => {
		const t = setTimeout(() => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				if (searchInput.trim()) next.set("search", searchInput.trim());
				else next.delete("search");
				next.delete("page");
				return next;
			});
		}, 400);
		return () => clearTimeout(t);
	}, [searchInput, setSearchParams]);

	const { data, isLoading, isError } = useComponentTypes(search, page, size, sort);
	const deleteComponentType = useDeleteComponentType();

	const content = useMemo(() => normalizeList(data), [data]);
	const filteredContent = useMemo(() => {
		if (!search.trim()) return content;
		const q = search.trim().toLowerCase();
		return content.filter((c) => c.type.toLowerCase().includes(q));
	}, [content, search]);

	const raw = data as Record<string, unknown> | undefined;
	const totalElements =
		raw && typeof raw === "object" && !Array.isArray(data)
			? Number(raw.totalElements ?? raw.total_elements ?? content.length)
			: content.length;
	const totalPagesFromApi = raw ? Number(raw.totalPages ?? raw.total_pages ?? 0) : 0;
	const totalPages =
		totalElements > 0
			? totalPagesFromApi > 0
				? totalPagesFromApi
				: Math.ceil(totalElements / size) || 1
			: 1;

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteComponentType.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const setSortInUrl = (value: string) =>
		setSearchParams((prev) => updateSearchParams(prev, { sort: value, page: 0 }));
	const setSizeInUrl = (value: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { size: value, page: 0 }));
	const hasNext = page < totalPages - 1;
	const hasPrev = page > 0;
	const setPageInUrl = (newPage: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { page: newPage }));

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Layout className="size-6 text-brand" />
						Bileşen Tipleri
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Bileşen şablonlarını listele, ara ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/component-types/create">
						<Plus className="size-4" />
						Yeni Bileşen Tipi
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bileşen tipi listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Tip ara..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-9 w-[220px]"
							/>
						</div>
						<Select value={sort} onValueChange={setSortInUrl}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Sırala" />
							</SelectTrigger>
							<SelectContent>
								{SORT_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={String(size)} onValueChange={(v) => setSizeInUrl(Number(v))}>
							<SelectTrigger className="w-[100px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZES.map((s) => (
									<SelectItem key={s} value={String(s)}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12 text-muted-foreground">
							Yükleniyor...
						</div>
					) : isError ? (
						<div className="flex items-center justify-center py-12 text-destructive">
							Bir hata oluştu. Lütfen tekrar deneyin.
						</div>
					) : content.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Layout className="size-10 opacity-50 text-brand" />
							<p>Henüz bileşen tipi yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/component-types/create" className="gap-2">
									<Plus className="size-4" />
									İlk bileşen tipini ekle
								</Link>
							</Button>
						</div>
					) : filteredContent.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Search className="size-10 opacity-50" />
							<p>Arama sonucu bulunamadı.</p>
							<p className="text-xs">&quot;{search}&quot; ile eşleşen kayıt yok</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>Önizleme</TableHead>
										<TableHead>Tip</TableHead>
										<TableHead>Özellikler</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredContent.map((ct) => (
										<TableRow key={ct.id} className="group">
											<TableCell className="font-mono text-muted-foreground">
												{ct.id}
											</TableCell>
											<TableCell>
												{ct.photo ? (
													<img
														src={getPhotoUrl(ct.photo)}
														alt={`Bileşen ${ct.id}`}
														className="h-12 w-auto max-w-[80px] object-contain rounded border border-border/60 bg-muted/30"
													/>
												) : (
													<span className="flex items-center gap-2 text-muted-foreground text-sm">
														<FileImage className="size-4" />
														—
													</span>
												)}
											</TableCell>
											<TableCell className="font-medium">{ct.type || "—"}</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1.5">
													{ct.hasTitle && (
														<Badge variant="secondary" className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">
															Başlık
														</Badge>
													)}
													{ct.hasExcerpt && (
														<Badge variant="secondary" className="text-xs border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400">
															Özet
														</Badge>
													)}
													{ct.hasDescription && (
														<Badge variant="secondary" className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
															Açıklama
														</Badge>
													)}
													{ct.hasImage && (
														<Badge variant="secondary" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
															Görsel
														</Badge>
													)}
													{ct.hasValue && (
														<Badge variant="secondary" className="text-xs border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
															Değer
														</Badge>
													)}
													{ct.hasAsset && (
														<Badge variant="secondary" className="text-xs border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400">
															Medya
														</Badge>
													)}
													{ct.hasLink && (
														<Badge variant="secondary" className="text-xs border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400">
															Link
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
														<Link to={`/component-types/${ct.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button variant="ghost" size="icon" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
														<Link to={`/component-types/${ct.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(ct)}
														className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
														title="Sil"
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-muted/10">
								<p className="text-sm text-muted-foreground">
									Toplam {totalElements} bileşen tipi
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPageInUrl(Math.max(0, page - 1))}
										disabled={!hasPrev}
									>
										<ChevronLeft className="size-4" />
										Önceki
									</Button>
									<span className="text-sm text-muted-foreground px-2">
										Sayfa {page + 1} / {totalPages || 1}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPageInUrl(Math.min(totalPages - 1, page + 1))}
										disabled={!hasNext}
									>
										Sonraki
										<ChevronRight className="size-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Bileşen tipini sil"
				description={
					deleteTarget
						? `ID ${deleteTarget.id} bileşen tipini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteComponentType.isPending}
			/>
		</div>
	);
}
