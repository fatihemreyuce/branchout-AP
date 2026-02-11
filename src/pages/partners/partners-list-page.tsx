import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Handshake,
	Plus,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
	ImageIcon,
} from "lucide-react";
import { usePartners, useDeletePartner } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
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
import type { PartnerResponse } from "@/types/partners.types";

const SORT_OPTIONS = [
	{ value: "orderIndex,asc", label: "Sıra (artan)" },
	{ value: "orderIndex,desc", label: "Sıra (azalan)" },
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
];

const PAGE_SIZES = [5, 10, 20, 50];

function updateSearchParams(
	prev: URLSearchParams,
	updates: { sort?: string; page?: number; size?: number }
): URLSearchParams {
	const next = new URLSearchParams(prev);
	if (updates.sort !== undefined) next.set("sort", updates.sort);
	if (updates.page !== undefined) {
		if (updates.page === 0) next.delete("page");
		else next.set("page", String(updates.page));
	}
	if (updates.size !== undefined) next.set("size", String(updates.size));
	return next;
}

function getLogoUrl(logo: string): string {
	if (!logo) return "";
	if (logo.startsWith("http") || logo.startsWith("//")) return logo;
	return logo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${logo}` : logo;
}

function normalizePartnersList(data: unknown): PartnerResponse[] {
	const raw = data as Record<string, unknown> | unknown[] | undefined;
	const arr = Array.isArray(raw) ? raw : (raw && typeof raw === "object" && (raw as Record<string, unknown>).content != null ? (raw as Record<string, unknown>).content : (raw as Record<string, unknown>)?.data) ?? [];
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		return {
			id: Number(item.id ?? item.Id ?? 0),
			logo: String(item.logo ?? item.Logo ?? ""),
			orderIndex: Number(item.orderIndex ?? item.order_index ?? 0),
		} satisfies PartnerResponse;
	});
}

export default function PartnersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const sort = searchParams.get("sort") ?? "orderIndex,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<PartnerResponse | null>(null);
	const { data, isLoading, isError } = usePartners();
	const deletePartner = useDeletePartner();

	const handleDelete = () => {
		if (!deleteTarget) return;
		deletePartner.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const raw = data as Record<string, unknown> | undefined;
	const content = normalizePartnersList(data);
	const totalElements = raw && !Array.isArray(data) ? Number(raw.totalElements ?? raw.total_elements ?? content.length) : content.length;
	const totalPagesFromApi = raw ? Number(raw.totalPages ?? raw.total_pages ?? 0) : 0;
	const totalPages = totalElements > 0 ? (totalPagesFromApi > 0 ? totalPagesFromApi : Math.ceil(totalElements / size) || 1) : 1;

	const sortedContent = useMemo(() => {
		const [sortField, sortDir] = sort.split(",");
		const dir = sortDir === "desc" ? -1 : 1;
		return [...content].sort((a, b) => {
			const aVal = sortField === "orderIndex" ? a.orderIndex : a.id;
			const bVal = sortField === "orderIndex" ? b.orderIndex : b.id;
			return (aVal - bVal) * dir;
		});
	}, [content, sort]);

	const paginatedContent = useMemo(() => {
		const start = page * size;
		return sortedContent.slice(start, start + size);
	}, [sortedContent, page, size]);

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
						<Handshake className="size-6 text-brand" />
						Partner&apos;lar
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Partner logolarını listele, sırala ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/partners/create">
						<Plus className="size-4" />
						Yeni Partner
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Partner listesi</CardTitle>
					<CardDescription>
						Sıralama ve sayfalama ile filtreleyin (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
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
					) : sortedContent.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Handshake className="size-10 opacity-50 text-brand" />
							<p>Henüz partner yok.</p>
							<Button asChild variant="outline" size="sm" className="border-brand-outline text-brand hover:bg-brand-muted">
								<Link to="/partners/create" className="gap-2">
									<Plus className="size-4" />
									İlk partner&apos;ı ekle
								</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>Logo</TableHead>
										<TableHead className="w-[120px]">Sıra</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedContent.map((partner) => (
										<TableRow key={partner.id} className="group">
											<TableCell className="font-mono text-muted-foreground">{partner.id}</TableCell>
											<TableCell>
												{partner.logo ? (
													<img
														src={getLogoUrl(partner.logo)}
														alt={`Partner ${partner.id}`}
														className="h-10 w-auto max-w-[120px] object-contain rounded border border-border/60 bg-muted/30"
													/>
												) : (
													<span className="flex items-center gap-2 text-muted-foreground text-sm">
														<ImageIcon className="size-4" />
														Logo yok
													</span>
												)}
											</TableCell>
											<TableCell className="font-medium">{partner.orderIndex}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
														<Link to={`/partners/${partner.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button variant="ghost" size="icon" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
														<Link to={`/partners/${partner.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(partner)}
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
								<p className="text-sm text-muted-foreground">Toplam {totalElements} partner</p>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={() => setPageInUrl(Math.max(0, page - 1))} disabled={!hasPrev}>
										<ChevronLeft className="size-4" />
										Önceki
									</Button>
									<span className="text-sm text-muted-foreground px-2">
										Sayfa {page + 1} / {totalPages || 1}
									</span>
									<Button variant="outline" size="sm" onClick={() => setPageInUrl(Math.min(totalPages - 1, page + 1))} disabled={!hasNext}>
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
				title="Partner'ı sil"
				description={
					deleteTarget
						? `ID ${deleteTarget.id} (sıra ${deleteTarget.orderIndex}) partner kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deletePartner.isPending}
			/>
		</div>
	);
}
