import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Database,
	Plus,
	Trash2,
	Download,
	HardDrive,
	FolderArchive,
	Loader2,
	CheckCircle2,
	XCircle,
	Clock,
	FileArchive,
} from "lucide-react";
import { useBackups, useCreateBackup, useDeleteBackup, useDownloadBackup } from "@/hooks/use-backups";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ListPagination } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import type { BackupResponse } from "@/types/backups.types";

const PAGE_SIZES = [5, 10, 20, 50];
const BACKUP_TYPES: { value: BackupResponse["backupType"]; label: string; icon: typeof Database }[] = [
	{ value: "DATABASE", label: "Veritabanı", icon: Database },
	{ value: "UPLOADS", label: "Yüklemeler", icon: FolderArchive },
	{ value: "FULL", label: "Tam Yedek", icon: HardDrive },
];

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
	try {
		const d = new Date(iso);
		return d.toLocaleDateString("tr-TR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return iso;
	}
}

function StatusBadge({ status }: { status: BackupResponse["status"] }) {
	if (status === "SUCCESS")
		return (
			<Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
				<CheckCircle2 className="size-3.5" />
				Başarılı
			</Badge>
		);
	if (status === "FAILED")
		return (
			<Badge variant="destructive" className="gap-1">
				<XCircle className="size-3.5" />
				Başarısız
			</Badge>
		);
	return (
		<Badge variant="secondary" className="gap-1">
			<Loader2 className="size-3.5 animate-spin" />
			İşleniyor
		</Badge>
	);
}

function TypeBadge({ type }: { type: BackupResponse["backupType"] }) {
	const config = BACKUP_TYPES.find((t) => t.value === type);
	const Icon = config?.icon ?? FileArchive;
	return (
		<Badge variant="outline" className="gap-1.5 font-normal">
			<Icon className="size-3.5 text-muted-foreground" />
			{config?.label ?? type}
		</Badge>
	);
}

/** API snake_case dönebilir */
function normalizeBackupsList(data: unknown): BackupResponse[] {
	const raw = data as Record<string, unknown> | undefined;
	const arr = raw?.content ?? raw?.data;
	const list = Array.isArray(arr) ? arr : [];
	return list.map((x) => {
		const item = typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {};
		return {
			id: Number(item.id ?? 0),
			filename: String(item.filename ?? item.file_name ?? ""),
			filePath: String(item.filePath ?? item.file_path ?? ""),
			fileSize: Number(item.fileSize ?? item.file_size ?? 0),
			backupType: String(item.backupType ?? item.backup_type ?? "FULL") as BackupResponse["backupType"],
			status: String(item.status ?? "IN_PROGRESS") as BackupResponse["status"],
			errorMessage: String(item.errorMessage ?? item.error_message ?? ""),
			createdAt: String(item.createdAt ?? item.created_at ?? ""),
			expiresAt: String(item.expiresAt ?? item.expires_at ?? ""),
		} satisfies BackupResponse;
	});
}

export default function BackupsListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Math.max(0, Number(searchParams.get("page")) || 0);
	const size = Number(searchParams.get("size")) || 10;

	const [createOpen, setCreateOpen] = useState(false);
	const [createType, setCreateType] = useState<BackupResponse["backupType"]>("FULL");
	const [deleteTarget, setDeleteTarget] = useState<BackupResponse | null>(null);

	const { data, isLoading, isError } = useBackups(page, size);
	const createBackup = useCreateBackup();
	const deleteBackup = useDeleteBackup();
	const downloadBackup = useDownloadBackup();

	const content = normalizeBackupsList(data ?? {});
	const raw = data as Record<string, unknown> | undefined;
	const totalElements =
		raw && typeof raw === "object" && !Array.isArray(data)
			? Number(raw.totalElements ?? raw.total_elements ?? content.length)
			: content.length;
	const totalPages =
		totalElements > 0 ? Math.ceil(totalElements / size) || 1 : 1;

	const setPageInUrl = (newPage: number) =>
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (newPage <= 0) next.delete("page");
			else next.set("page", String(newPage));
			return next;
		});
	const setSizeInUrl = (newSize: number) =>
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("size", String(newSize));
			next.delete("page");
			return next;
		});

	const handleCreate = () => {
		createBackup.mutate(createType, {
			onSuccess: () => {
				setCreateOpen(false);
				setCreateType("FULL");
			},
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteBackup.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const handleDownload = (backup: BackupResponse) => {
		if (backup.status !== "SUCCESS") return;
		downloadBackup.mutate({ id: backup.id, filename: backup.filename || undefined });
	};

	return (
		<div className="space-y-6">
			{/* Başlık ve Yeni Backup */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Database className="size-6 text-brand" />
						Yedekler
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Veritabanı, yüklemeler veya tam yedek oluşturun ve indirin
					</p>
				</div>
				<Button
					onClick={() => setCreateOpen(true)}
					className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
				>
					<Plus className="size-4" />
					Yeni Yedek
				</Button>
			</div>

			{/* Tablo kartı */}
			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Yedek listesi</CardTitle>
					<CardDescription>
						Oluşturulan yedekleri görüntüleyin, indirin veya silin
					</CardDescription>
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:flex-wrap">
						<Select
							value={String(size)}
							onValueChange={(v) => setSizeInUrl(Number(v))}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="Sayfa boyutu" />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZES.map((s) => (
									<SelectItem key={s} value={String(s)}>
										{s} / sayfa
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
							<Loader2 className="size-6 animate-spin" />
							Yükleniyor...
						</div>
					) : isError ? (
						<div className="flex items-center justify-center py-16 text-destructive">
							Bir hata oluştu. Lütfen tekrar deneyin.
						</div>
					) : content.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
							<FileArchive className="size-12 opacity-50 text-brand" />
							<p>Henüz yedek yok.</p>
							<Button
								variant="outline"
								size="sm"
								className="border-brand-outline text-brand hover:bg-brand-muted gap-2"
								onClick={() => setCreateOpen(true)}
							>
								<Plus className="size-4" />
								İlk yedeği oluştur
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[60px]">ID</TableHead>
										<TableHead>Dosya adı</TableHead>
										<TableHead>Tip</TableHead>
										<TableHead>Durum</TableHead>
										<TableHead>Boyut</TableHead>
										<TableHead>Oluşturulma</TableHead>
										<TableHead className="w-[140px] text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{content.map((backup) => (
										<TableRow key={backup.id} className="group">
											<TableCell className="font-mono text-muted-foreground text-sm">
												{backup.id}
											</TableCell>
											<TableCell className="font-medium max-w-[200px] truncate" title={backup.filename}>
												{backup.filename || "—"}
											</TableCell>
											<TableCell>
												<TypeBadge type={backup.backupType} />
											</TableCell>
											<TableCell>
												<StatusBadge status={backup.status} />
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{backup.fileSize > 0 ? formatBytes(backup.fileSize) : "—"}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm flex items-center gap-1.5">
												<Clock className="size-3.5 shrink-0" />
												{backup.createdAt ? formatDate(backup.createdAt) : "—"}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1 w-fit ml-auto">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDownload(backup)}
														disabled={backup.status !== "SUCCESS" || downloadBackup.isPending}
														className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
														title="İndir"
													>
														{downloadBackup.isPending ? (
															<Loader2 className="size-4 animate-spin" />
														) : (
															<Download className="size-4" />
														)}
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setDeleteTarget(backup)}
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
								label={`Toplam ${totalElements} yedek`}
							/>
						</>
					)}
				</CardContent>
			</Card>

			{/* Yeni yedek dialog */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="sm:max-w-md gap-0 overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-2xl">
					<div className="flex flex-col">
						<div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2">
							<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
								<Database className="size-7" />
							</div>
							<DialogHeader className="space-y-2 text-center">
								<DialogTitle className="text-xl font-semibold tracking-tight">
									Yeni yedek oluştur
								</DialogTitle>
								<DialogDescription className="text-sm text-muted-foreground max-w-[85%] mx-auto">
									Yedek türünü seçin. İşlem arka planda başlayacaktır.
								</DialogDescription>
							</DialogHeader>
						</div>
						<div className="px-6 pb-6 space-y-3">
							<label className="text-sm font-medium">Yedek türü</label>
							<Select
								value={createType}
								onValueChange={(v) => setCreateType(v as BackupResponse["backupType"])}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{BACKUP_TYPES.map((t) => {
										const Icon = t.icon;
										return (
											<SelectItem key={t.value} value={t.value}>
												<span className="flex items-center gap-2">
													<Icon className="size-4 text-muted-foreground" />
													{t.label}
												</span>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter className="flex flex-row gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => setCreateOpen(false)}
								disabled={createBackup.isPending}
							>
								Vazgeç
							</Button>
							<Button
								type="button"
								onClick={handleCreate}
								disabled={createBackup.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createBackup.isPending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Oluşturuluyor...
									</>
								) : (
									<>
										<Plus className="size-4" />
										Oluştur
									</>
								)}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Yedeği sil"
				description={
					deleteTarget
						? `"${deleteTarget.filename || `ID ${deleteTarget.id}`}" yedeğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
						: undefined
				}
				confirmValue={deleteTarget ? String(deleteTarget.id) : undefined}
				confirmLabel="Silmek için ID'yi yazın"
				confirmText="Sil"
				cancelText="Vazgeç"
				onConfirm={handleDelete}
				loading={deleteBackup.isPending}
			/>
		</div>
	);
}
