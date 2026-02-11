import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Languages,
	Plus,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
	BookOpen,
} from "lucide-react";
import { useLanguages, useDeleteLanguage } from "@/hooks/use-languages";
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
import type { LanguageResponse } from "@/types/languages.types";

const SORT_OPTIONS = [
	{ value: "code,asc", label: "Kod (A-Z)" },
	{ value: "code,desc", label: "Kod (Z-A)" },
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

export default function LanguagesListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const sort = searchParams.get("sort") ?? "code,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<LanguageResponse | null>(null);
	const { data, isLoading, isError } = useLanguages(page, size, sort);
	const deleteLanguage = useDeleteLanguage();

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteLanguage.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const setSortInUrl = (value: string) =>
		setSearchParams((prev) => updateSearchParams(prev, { sort: value, page: 0 }));
	const setSizeInUrl = (value: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { size: value, page: 0 }));
	const setPageInUrl = (newPage: number) =>
		setSearchParams((prev) => updateSearchParams(prev, { page: newPage }));

	const totalPages = data?.totalPages ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const content = data?.content ?? [];
	const hasNext = page < totalPages - 1;
	const hasPrev = page > 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Languages className="size-6" />
						Diller
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Tüm dilleri listele, oluştur ve yönet
					</p>
				</div>
				<Button asChild>
					<Link to="/languages/create" className="gap-2">
						<BookOpen className="size-4" />
						Yeni Dil
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Dil listesi</CardTitle>
					<CardDescription>
						Sıralama ve sayfalama ile filtreleyin (filtreler URL'de saklanır)
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
				<CardContent>
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
							<Languages className="size-10 opacity-50" />
							<p>Henüz dil yok.</p>
							<Button asChild variant="outline" size="sm">
								<Link to="/languages/create" className="gap-2">
									<Plus className="size-4" />
									İlk dili oluştur
								</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>Kod</TableHead>
										<TableHead className="w-[140px] text-right">
											İşlemler
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{content.map((lang) => (
										<TableRow key={lang.id}>
											<TableCell className="font-mono text-muted-foreground">
												{lang.id}
											</TableCell>
											<TableCell className="font-medium">{lang.code}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
														<Link to={`/languages/${lang.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button variant="ghost" size="icon" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
														<Link to={`/languages/${lang.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(lang)}
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
							<div className="flex items-center justify-between gap-4 pt-4 border-t border-border/60 mt-4">
								<p className="text-sm text-muted-foreground">
									Toplam {totalElements} dil
								</p>
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
				title="Dili sil"
				description={
					deleteTarget
						? `"${deleteTarget.code}" dilini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget?.code}
				confirmLabel="Silmek için dil kodunu yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteLanguage.isPending}
			/>
		</div>
	);
}
