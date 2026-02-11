import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Users,
	Plus,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
	Search,
	UserCircle,
} from "lucide-react";
import { useTeamMembers, useDeleteTeamMember } from "@/hooks/use-team-members";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { TeamMemberResponse } from "@/types/team.members.types";

const SORT_OPTIONS = [
	{ value: "id,asc", label: "ID (artan)" },
	{ value: "id,desc", label: "ID (azalan)" },
	{ value: "name,asc", label: "İsim (A-Z)" },
	{ value: "name,desc", label: "İsim (Z-A)" },
	{ value: "email,asc", label: "E-posta (A-Z)" },
	{ value: "email,desc", label: "E-posta (Z-A)" },
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

function getPhotoUrl(photo: string): string {
	if (!photo) return "";
	if (photo.startsWith("http") || photo.startsWith("//")) return photo;
	return photo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${photo}` : photo;
}

/** API snake_case dönebilir; camelCase'e normalize eder */
function normalizeTeamMembersList(data: unknown): TeamMemberResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data;
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		const locRaw = item.localizations ?? item.Localizations;
		const locs = Array.isArray(locRaw) ? locRaw : [];
		return {
			id: Number(item.id ?? item.Id ?? 0),
			name: String(item.name ?? item.Name ?? ""),
			linkedinUrl: String(item.linkedinUrl ?? item.linkedin_url ?? ""),
			email: String(item.email ?? item.Email ?? ""),
			photo: String(item.photo ?? item.Photo ?? ""),
			localizations: locs.map((l: Record<string, unknown>) => ({
				languageCode: String(l.languageCode ?? l.language_code ?? ""),
				title: String(l.title ?? l.Title ?? ""),
				description: String(l.description ?? l.Description ?? ""),
			})),
		} satisfies TeamMemberResponse;
	});
}

export default function TeamMembersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get("search") ?? "";
	const sort = searchParams.get("sort") ?? "id,asc";
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [deleteTarget, setDeleteTarget] = useState<TeamMemberResponse | null>(null);
	const [searchInput, setSearchInput] = useState(search);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	// Yazarken otomatik arama (debounce 400ms)
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
	}, [searchInput]);

	const { data, isLoading, isError } = useTeamMembers(search, page, size, sort);
	const deleteTeamMember = useDeleteTeamMember();

	const content = useMemo(() => normalizeTeamMembersList(data), [data]);
	const filteredContent = useMemo(() => {
		if (!search.trim()) return content;
		const q = search.trim().toLowerCase();
		return content.filter(
			(m) =>
				m.name.toLowerCase().includes(q) ||
				m.email.toLowerCase().includes(q)
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

	// API paginates; content is already the current page items

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteTeamMember.mutate(deleteTarget.id, {
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
						<Users className="size-6 text-brand" />
						Ekip Üyeleri
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Ekip üyelerini listele, ara ve yönet
					</p>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to="/team-members/create">
						<Plus className="size-4" />
						Yeni Ekip Üyesi
					</Link>
				</Button>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Ekip üyesi listesi</CardTitle>
					<CardDescription>
						Arama, sıralama ve sayfalama (filtreler URL&apos;de saklanır)
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="İsim veya e-posta ara..."
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
							<UserCircle className="size-10 opacity-50 text-brand" />
							<p>Henüz ekip üyesi yok.</p>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted"
							>
								<Link to="/team-members/create" className="gap-2">
									<Plus className="size-4" />
									İlk ekip üyesini ekle
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
										<TableHead>Üye</TableHead>
										<TableHead>E-posta</TableHead>
										<TableHead>LinkedIn</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredContent.map((member) => (
										<TableRow key={member.id} className="group">
											<TableCell className="font-mono text-muted-foreground">
												{member.id}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="size-10 ring-2 ring-border/60">
														<AvatarImage src={getPhotoUrl(member.photo)} alt={member.name} />
														<AvatarFallback className="bg-brand-muted text-brand font-medium">
															{member.name.slice(0, 2).toUpperCase() || "?"}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium">{member.name || "—"}</span>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">{member.email || "—"}</TableCell>
											<TableCell>
												{member.linkedinUrl ? (
													<a
														href={member.linkedinUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-brand hover:underline text-sm"
													>
														Profil
													</a>
												) : (
													<span className="text-muted-foreground">—</span>
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
														<Link to={`/team-members/${member.id}`} title="Detay">
															<Eye className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														asChild
														className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
													>
														<Link to={`/team-members/${member.id}/edit`} title="Düzenle">
															<Pencil className="size-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(member)}
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
									Toplam {totalElements} ekip üyesi
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
				title="Ekip üyesini sil"
				description={
					deleteTarget
						? `"${deleteTarget.name}" (ID ${deleteTarget.id}) ekip üyesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteTeamMember.isPending}
			/>
		</div>
	);
}
