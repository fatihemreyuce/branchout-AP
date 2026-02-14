import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	FileText,
	Plus,
	Pencil,
	Trash2,
	Eye,
	Search,
} from "lucide-react";
import { usePages, useDeletePage } from "@/hooks/use-page";
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
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ListPagination } from "@/components/list-pagination";
import { BorderBeam } from "@/components/ui/border-beam";
import type { PageResponse } from "@/types/page.types";

const SORT_OPTIONS = [
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
	{ value: "name,asc", label: "Ad (A-Z)" },
	{ value: "name,desc", label: "Ad (Z-A)" },
	{ value: "slug,asc", label: "Slug (A-Z)" },
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

function normalizeList(data: unknown): PageResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data ?? [];
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		const typeVal = item.type;
		const typeObj = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal)
			? (typeVal as Record<string, unknown>) : {};
		// API bazen type'ı string döner (örn. "Hakkımızda")
		const typeNormalized = typeof typeVal === "string" ? { type: typeVal } : typeObj;
		return {
			id: Number(item.id ?? item.Id ?? 0),
			slug: String(item.slug ?? item.Slug ?? ""),
			name: String(item.name ?? item.Name ?? ""),
			typeId: Number(item.typeId ?? item.type_id ?? typeObj?.id ?? 0),
			type: typeNormalized,
			localizations: Array.isArray(item.localizations) ? item.localizations : [],
			components: Array.isArray(item.components) ? item.components : [],
			teamMembers: Array.isArray(item.teamMembers ?? item.team_members) ? (item.teamMembers ?? item.team_members) : [],
			createdAt: String(item.createdAt ?? item.created_at ?? ""),
			updatedAt: String(item.updatedAt ?? item.updated_at ?? ""),
		} as PageResponse;
	});
}

export default function PagesListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<PageResponse | null>(null);
	const [searchInput, setSearchInput] = useState(search);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	useEffect(() => {
		if (searchInput === search) return;
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
	}, [searchInput, search, setSearchParams]);

	const { data, isLoading, isError } = usePages(search, page, size, sort);
	const deletePage = useDeletePage();

	const content = useMemo(() => normalizeList(data), [data]);
	const filteredContent = useMemo(() => {
		if (!search.trim()) return content;
		const q = search.trim().toLowerCase();
		return content.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.slug.toLowerCase().includes(q)
		);
	}, [content, search]);

	const raw = data as Record<string, unknown> | undefined;
	const totalElements =
		raw && typeof raw === "object" && !Array.isArray(data)
			? Number(raw.totalElements ?? raw.total_elements ?? content.length)
			: content.length;
	const totalPages =
		totalElements > 0 ? Math.ceil(totalElements / size) || 1 : 1;

	const handleDelete = () => {
		if (!deleteTarget) return;
		deletePage.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const setSortInUrl = (value: string) =>
		setSearchParams((prev) => updateSearchParams(prev, { sort: value, page: 0 }));
	const setSizeInUrl = (value: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { size: value, page: 0 }));
	const setPageInUrl = (newPage: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { page: newPage }));

	const getTypeName = (p: PageResponse) => {
		const t = p.type;
		if (!t) return "—";
		if (typeof t === "string") return t;
		return String((t as Record<string, unknown>).type ?? (t as Record<string, unknown>).Type ?? "—");
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden relative">
						<BorderBeam size={50} duration={8} />
						<FileText className="size-6 relative z-10" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Sayfalar</h1>
						<p className="text-muted-foreground text-sm mt-0.5">
							Sayfaları listele, ara ve yönet
						</p>
					</div>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/pages/create">
						<Plus className="size-4" />
						Yeni Sayfa
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Sayfa listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Ad veya slug ara..."
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
							<FileText className="size-10 opacity-50 text-brand" />
							<p>Henüz sayfa yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/pages/create" className="gap-2">
									<Plus className="size-4" />
									İlk sayfayı ekle
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
										<TableHead>Ad</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Tip</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredContent.map((p) => (
										<TableRow key={p.id} className="group">
											<TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
											<TableCell className="font-medium">{p.name || "—"}</TableCell>
											<TableCell className="font-mono text-sm">{p.slug || "—"}</TableCell>
											<TableCell className="text-muted-foreground">{getTypeName(p)}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
														<Link to={`/pages/${p.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button variant="ghost" size="icon" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
														<Link to={`/pages/${p.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(p)}
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
							<ListPagination
								page={page}
								totalPages={totalPages}
								totalElements={totalElements}
								onPageChange={setPageInUrl}
								label={`Toplam ${totalElements} sayfa`}
							/>
						</>
					)}
				</CardContent>
			</Card>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Sayfayı sil"
				description={
					deleteTarget
						? `"${deleteTarget.name || `Sayfa #${deleteTarget.id}`}" sayfasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget?.name?.trim() || (deleteTarget ? `Sayfa #${deleteTarget.id}` : undefined)}
				confirmLabel="Silmek için sayfa adını yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deletePage.isPending}
			/>
		</div>
	);
}
