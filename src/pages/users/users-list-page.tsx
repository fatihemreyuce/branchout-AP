import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Users,
	Search,
	Plus,
	Pencil,
	Trash2,
	Eye,
	UserPlus,
} from "lucide-react";
import { useUsersQuery, useDeleteUser } from "@/hooks/use-user";
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
import type { UserResponse } from "@/types/user.types";

const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS = [
	{ value: "createdAt,desc", label: "En yeni" },
	{ value: "createdAt,asc", label: "En eski" },
	{ value: "username,asc", label: "Kullanıcı adı (A-Z)" },
	{ value: "username,desc", label: "Kullanıcı adı (Z-A)" },
	{ value: "email,asc", label: "E-posta (A-Z)" },
	{ value: "email,desc", label: "E-posta (Z-A)" },
];

const PAGE_SIZES = [5, 10, 20, 50];

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("tr-TR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function updateSearchParams(
	prev: URLSearchParams,
	updates: { search?: string; sort?: string; page?: number; size?: number }
): URLSearchParams {
	const next = new URLSearchParams(prev);
	if (updates.search !== undefined) {
		if (updates.search) next.set("search", updates.search);
		else next.delete("search");
	}
	if (updates.sort !== undefined) {
		next.set("sort", updates.sort);
	}
	if (updates.page !== undefined) {
		if (updates.page === 0) next.delete("page");
		else next.set("page", String(updates.page));
	}
	if (updates.size !== undefined) {
		next.set("size", String(updates.size));
	}
	return next;
}

export default function UsersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "createdAt,desc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [searchInput, setSearchInput] = useState(search);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);

	const { data, isLoading, isError } = useUsersQuery(search, page, size, sort);
	const deleteUser = useDeleteUser();

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteUser.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const setSortInUrl = (value: string) => {
		setSearchParams((prev) =>
			updateSearchParams(prev, { sort: value, page: 0 })
		);
	};

	const setSizeInUrl = (value: number) => {
		setSearchParams((prev) =>
			updateSearchParams(prev, { size: value, page: 0 })
		);
	};

	const setPageInUrl = (newPage: number) => {
		setSearchParams((prev) => updateSearchParams(prev, { page: newPage }));
	};

	// API bazen snake_case (total_elements, total_pages) döndürebilir; her iki biçimi okuyoruz
	const raw = data as Record<string, unknown> | undefined;
	const totalElements = raw ? Number(raw.totalElements ?? raw.total_elements ?? (Array.isArray(raw.content) ? raw.content.length : 0)) : 0;
	const totalPages =
		totalElements > 0 ? Math.ceil(totalElements / size) || 1 : 1;
	const content = data?.content ?? [];
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Users className="size-6 text-brand" />
						Kullanıcılar
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Tüm kullanıcıları listele, oluştur ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/users/create" className="gap-2">
						<UserPlus className="size-4" />
						Yeni Kullanıcı
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Kullanıcı listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama ile filtreleyin (filtreler URL'de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Kullanıcı adı veya e-posta ara..."
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
						<Select
							value={String(size)}
							onValueChange={(v) => setSizeInUrl(Number(v))}
						>
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
							<Users className="size-10 opacity-50" />
							<p>Henüz kullanıcı yok.</p>
							<Button asChild variant="outline" size="sm">
								<Link to="/users/create" className="gap-2">
									<Plus className="size-4" />
									İlk kullanıcıyı oluştur
								</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[80px]">ID</TableHead>
										<TableHead>Kullanıcı adı</TableHead>
										<TableHead>E-posta</TableHead>
										<TableHead>Oluşturulma</TableHead>
										<TableHead>Güncellenme</TableHead>
										<TableHead className="w-[140px] text-right">
											İşlemler
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{content.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-mono text-muted-foreground">
												{user.id}
											</TableCell>
											<TableCell className="font-medium">
												{user.username}
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(user.createdAt)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(user.updatedAt)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
														<Link to={`/users/${user.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button variant="ghost" size="icon" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
														<Link
															to={`/users/${user.id}/edit`}
															title="Düzenle"
														>
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(user)}
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
								label={`Toplam ${totalElements} kullanıcı`}
								className="pt-4 mt-4"
							/>
						</>
					)}
				</CardContent>
			</Card>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Kullanıcıyı sil"
				description={
					deleteTarget
						? `"${deleteTarget.username}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmEmail={deleteTarget?.email}
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteUser.isPending}
			/>
		</div>
	);
}
