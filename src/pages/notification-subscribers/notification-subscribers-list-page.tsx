import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Plus, Trash2 } from "lucide-react";
import {
	useNotificationsSubscribers,
	useDeleteNotificationsSubscribers,
} from "@/hooks/use-subs-notifications";
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
import { ListPagination } from "@/components/list-pagination";
import type { notificationsSubscribersResponse } from "@/types/subs.notifications.types";

const SORT_OPTIONS = [
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
	{ value: "email,asc", label: "E-posta (A-Z)" },
	{ value: "email,desc", label: "E-posta (Z-A)" },
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

/** API snake_case dönebilir */
function normalizeSubscribersList(data: unknown): notificationsSubscribersResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data;
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		return {
			id: Number(item.id ?? 0),
			email: String(item.email ?? item.Email ?? ""),
		} satisfies notificationsSubscribersResponse;
	});
}

export default function NotificationSubscribersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<notificationsSubscribersResponse | null>(null);
	const { data, isLoading, isError } = useNotificationsSubscribers(page, size, sort);
	const deleteSubscriber = useDeleteNotificationsSubscribers();

	const content = normalizeSubscribersList(data ?? {});
	const raw = data as Record<string, unknown> | undefined;
	const totalElements =
		raw && typeof raw === "object" && !Array.isArray(data)
			? Number(raw.totalElements ?? raw.total_elements ?? content.length)
			: content.length;
	const totalPages =
		totalElements > 0 ? Math.ceil(totalElements / size) || 1 : 1;

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteSubscriber.mutate(deleteTarget.id, {
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
						<Mail className="size-6 text-brand" />
						Bildirim Aboneleri
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Bildirim abonelerini listele, oluştur ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/notification-subscribers/create" className="gap-2">
						<Plus className="size-4" />
						Yeni Abone
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Abone listesi</CardTitle>
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
					) : content.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Mail className="size-10 opacity-50 text-brand" />
							<p>Henüz abone yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/notification-subscribers/create" className="gap-2">
									<Plus className="size-4" />
									İlk aboneyi ekle
								</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>E-posta</TableHead>
										<TableHead className="w-[170px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{content.map((subscriber) => (
										<TableRow key={subscriber.id} className="group">
											<TableCell className="font-mono text-muted-foreground">
												{subscriber.id}
											</TableCell>
											<TableCell className="font-medium">{subscriber.email || "—"}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(subscriber)}
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
								label={`Toplam ${totalElements} abone`}
							/>
						</>
					)}
				</CardContent>
			</Card>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Aboneyi sil"
				description={
					deleteTarget
						? `ID ${deleteTarget.id} abonesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? deleteTarget.email : undefined}
				confirmLabel="Silmek için e-postayı yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteSubscriber.isPending}
			/>
		</div>
	);
}
