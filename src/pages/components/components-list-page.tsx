import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Puzzle,
	Plus,
	Pencil,
	Trash2,
	Eye,
	Search,
	Link2,
	Type,
	FileImage,
} from "lucide-react";
import { useComponents, useDeleteComponent } from "@/hooks/use-components";
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
import type { ComponentResponse } from "@/types/components.types";

const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS = [
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
	{ value: "name,asc", label: "Ad (A-Z)" },
	{ value: "name,desc", label: "Ad (Z-A)" },
	{ value: "value,asc", label: "Değer (A-Z)" },
	{ value: "value,desc", label: "Değer (Z-A)" },
];

const PAGE_SIZES = [5, 10, 20, 50];

function updateSearchParams(
	prev: URLSearchParams,
	updates: { search?: string; sort?: string; page?: number; size?: number }
): URLSearchParams {
	const next = new URLSearchParams(prev);
	if (updates.search !== undefined) {
		if (updates.search) next.set("search", updates.search);
		else next.delete("search");
	}
	if (updates.sort !== undefined) next.set("sort", updates.sort);
	if (updates.page !== undefined) {
		if (updates.page === 0) next.delete("page");
		else next.set("page", String(updates.page));
	}
	if (updates.size !== undefined) next.set("size", String(updates.size));
	return next;
}

function normalizeList(data: unknown): ComponentResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data ?? [];
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => normalizeItem(x));
}

function normalizeItem(x: unknown): ComponentResponse {
	const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
	const typeVal = item.type;
	const isTypeObject = typeVal != null && typeof typeVal === "object" && !Array.isArray(typeVal);
	const typeObj = isTypeObject ? (typeVal as Record<string, unknown>) : {};
	const typeId = Number(item.typeId ?? item.type_id ?? typeObj?.id ?? typeObj?.Id ?? 0);
	const typeName =
		typeof typeVal === "string" ? typeVal : String(typeObj.type ?? typeObj.Type ?? "");
	return {
		id: Number(item.id ?? item.Id ?? 0),
		name: String(item.name ?? item.Name ?? ""),
		typeId: typeId || (typeof typeVal === "number" ? typeVal : 0),
		type: {
			id: typeId,
			type: typeName,
			hasTitle: Boolean(typeObj.hasTitle ?? typeObj.has_title ?? false),
			hasExcerpt: Boolean(typeObj.hasExcerpt ?? typeObj.has_excerpt ?? false),
			hasDescription: Boolean(typeObj.hasDescription ?? typeObj.has_description ?? false),
			hasImage: Boolean(typeObj.hasImage ?? typeObj.has_image ?? false),
			hasValue: Boolean(typeObj.hasValue ?? typeObj.has_value ?? false),
			hasAsset: Boolean(typeObj.hasAsset ?? typeObj.has_asset ?? typeObj.hasAssets ?? false),
			photo: String(typeObj.photo ?? typeObj.Photo ?? ""),
			hasLink: Boolean(typeObj.hasLink ?? typeObj.has_link ?? typeObj.hasKind ?? typeObj.has_kind ?? false),
		},
		value: item.value != null && item.value !== "" ? String(item.value) : String(item.Value ?? ""),
		link: String(item.link ?? item.Link ?? ""),
		localizations: Array.isArray(item.localizations) ? item.localizations : [],
		assets: Array.isArray(item.assets) ? item.assets : [],
	};
}

export default function ComponentsListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [searchInput, setSearchInput] = useState(search);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ComponentResponse | null>(null);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	useEffect(() => {
		if (searchInput === search) return;
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			debounceRef.current = null;
			setSearchParams((prev) =>
				updateSearchParams(prev, { search: searchInput, page: 0 })
			);
		}, SEARCH_DEBOUNCE_MS);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchInput, search, setSearchParams]);

	const { data, isLoading, isError } = useComponents(search, page, size, sort);
	const deleteComponent = useDeleteComponent();

	const content = useMemo(() => normalizeList(data), [data]);
	const raw = data as Record<string, unknown> | undefined;
	const totalElements =
		raw && typeof raw === "object" && !Array.isArray(data)
			? Number(raw.totalElements ?? raw.total_elements ?? content.length)
			: content.length;
	const totalPages =
		totalElements > 0 ? Math.ceil(totalElements / size) || 1 : 1;
	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteComponent.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const setSortInUrl = (value: string) =>
		setSearchParams((prev) => updateSearchParams(prev, { sort: value, page: 0 }));
	const setSizeInUrl = (value: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { size: value, page: 0 }));
	const setPageInUrl = (newPage: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { page: newPage }));

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Puzzle className="size-6 text-brand" />
						Bileşenler
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Tüm bileşenleri listele, oluştur ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/components/create">
						<Plus className="size-4" />
						Yeni Bileşen
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Bileşen listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama ile filtreleyin (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Ad veya değer ara..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-9"
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
							<Puzzle className="size-10 opacity-50 text-brand" />
							<p>Henüz bileşen yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/components/create" className="gap-2">
									<Plus className="size-4" />
									İlk bileşeni ekle
								</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>Ad</TableHead>
										<TableHead>Tip</TableHead>
										<TableHead>Değer</TableHead>
										<TableHead>Medya</TableHead>
										<TableHead>Link</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{content.map((c) => (
										<TableRow key={c.id} className="group">
											<TableCell className="font-mono text-muted-foreground">
												{c.id}
											</TableCell>
											<TableCell className="font-medium">{c.name || "—"}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1.5">
													<Type className="size-4 text-muted-foreground shrink-0" />
													<span className="text-sm">{c.type?.type || "—"}</span>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground text-sm max-w-[140px] truncate">
												{c.value || "—"}
											</TableCell>
											<TableCell>
												{c.assets && c.assets.length > 0 ? (
													<span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
														<FileImage className="size-4 shrink-0 text-violet-500" />
														{c.assets.length}
													</span>
												) : (
													<span className="text-muted-foreground text-sm">—</span>
												)}
											</TableCell>
											<TableCell>
												{c.link ? (
													<a
														href={c.link}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
													>
														<Link2 className="size-3.5" />
														Link
													</a>
												) : (
													<span className="text-muted-foreground text-sm">—</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button
														variant="ghost"
														size="icon"
														asChild
														className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
													>
														<Link to={`/components/${c.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														asChild
														className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
													>
														<Link to={`/components/${c.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(c)}
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
								label={`Toplam ${totalElements} bileşen`}
							/>
						</>
					)}
				</CardContent>
			</Card>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Bileşeni sil"
				description={
					deleteTarget
						? `"${deleteTarget.name}" bileşenini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteComponent.isPending}
			/>
		</div>
	);
}
