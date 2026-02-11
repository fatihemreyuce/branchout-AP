import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	ImageIcon,
	Plus,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
	Search,
	FileImage,
} from "lucide-react";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
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
import type { AssetResponse } from "@/types/assets.types";

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

function getAssetUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("//")) return url;
	return url.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${url}` : url;
}

function isImage(mime: string): boolean {
	return mime?.startsWith("image/") ?? false;
}

function isVideo(mime: string): boolean {
	return mime?.startsWith("video/") ?? false;
}

/** API snake_case dönebilir */
function normalizeAssetsList(data: unknown): AssetResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data;
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
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
		} satisfies AssetResponse;
	});
}

export default function AssetsListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<AssetResponse | null>(null);
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

	const { data, isLoading, isError } = useAssets(search, page, size, sort);
	const deleteAsset = useDeleteAsset();

	const content = useMemo(() => normalizeAssetsList(data), [data]);
	const filteredContent = useMemo(() => {
		if (!search.trim()) return content;
		const q = search.trim().toLowerCase();
		return content.filter(
			(a) =>
				a.type.toLowerCase().includes(q) ||
				a.mime.toLowerCase().includes(q)
		);
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
		deleteAsset.mutate(deleteTarget.id, {
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
						<ImageIcon className="size-6 text-brand" />
						Medyalar
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Medya ve dosya varlıklarını listele, ara ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/assets/create">
						<Plus className="size-4" />
						Yeni Medya
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Medya listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Tip veya MIME ara..."
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
							<FileImage className="size-10 opacity-50 text-brand" />
							<p>Henüz medya yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/assets/create" className="gap-2">
									<Plus className="size-4" />
									İlk medyayı ekle
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
										<TableHead>Boyut</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredContent.map((asset) => (
										<TableRow key={asset.id} className="group">
											<TableCell className="font-mono text-muted-foreground">
												{asset.id}
											</TableCell>
											<TableCell>
												{asset.url && isImage(asset.mime) ? (
													<img
														src={getAssetUrl(asset.url)}
														alt={`Medya ${asset.id}`}
														className="h-12 w-auto max-w-[120px] object-contain rounded border border-border/60 bg-muted/30"
													/>
												) : asset.url && isVideo(asset.mime) ? (
													<video
														src={getAssetUrl(asset.url)}
														className="h-12 w-auto max-w-[120px] object-contain rounded border border-border/60 bg-muted/30"
														preload="metadata"
														muted
														playsInline
													/>
												) : (
													<span className="flex items-center gap-2 text-muted-foreground text-sm">
														<FileImage className="size-4" />
														{asset.mime || "—"}
													</span>
												)}
											</TableCell>
											<TableCell className="font-medium">{asset.type || "—"}</TableCell>
											<TableCell className="text-muted-foreground">
												{asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button
														variant="ghost"
														size="icon"
														asChild
														className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
													>
														<Link to={`/assets/${asset.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														asChild
														className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
													>
														<Link to={`/assets/${asset.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(asset)}
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
									Toplam {totalElements} medya
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
				title="Medyayı sil"
				description={
					deleteTarget
						? `ID ${deleteTarget.id} medya kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteAsset.isPending}
			/>
		</div>
	);
}
