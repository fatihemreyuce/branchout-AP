import { useState, useEffect } from "react";
import { Trash2, Loader2, Mail, AlertTriangle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	/** E-posta eşleşmeden silme butonu aktif olmaz */
	confirmEmail?: string;
	/** Genel onay: yazılması gereken değer (örn. ofis adı) */
	confirmValue?: string;
	/** Onay alanı etiketi (confirmValue ile kullanın) */
	confirmLabel?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	loading?: boolean;
}

export function DeleteConfirmDialog({
	open,
	onOpenChange,
	title = "Silmeyi onayla",
	description,
	confirmEmail,
	confirmValue,
	confirmLabel,
	confirmText = "Sil",
	cancelText = "Vazgeç",
	onConfirm,
	loading = false,
}: DeleteConfirmDialogProps) {
	const [confirmInput, setConfirmInput] = useState("");
	const valueToMatch = confirmValue ?? confirmEmail;
	const inputMatches =
		!valueToMatch || confirmInput.trim().toLowerCase() === valueToMatch.trim().toLowerCase();
	const canDelete = inputMatches && !loading;
	const confirmInputLabel = confirmLabel ?? "Silmek için e-postayı yazın";

	useEffect(() => {
		if (open) setConfirmInput("");
	}, [open]);

	const handleConfirm = () => {
		if (!canDelete) return;
		onConfirm();
	};

	const handleCancel = () => {
		if (!loading) onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md gap-0 overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-2xl shadow-black/10 dark:shadow-black/30">
				<div className="flex flex-col">
					{/* Üst bölüm: ikon + başlık */}
					<div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2">
						<div className="flex size-20 items-center justify-center rounded-2xl bg-red-500/10 shadow-inner ring-2 ring-red-500/20">
							<Trash2 className="size-10 text-red-600 dark:text-red-400" />
						</div>
						<DialogHeader className="space-y-2 text-center">
							<DialogTitle className="text-xl font-semibold tracking-tight">
								{title}
							</DialogTitle>
							{description ? (
								<DialogDescription className="text-sm leading-relaxed text-muted-foreground max-w-[85%] mx-auto">
									{description}
								</DialogDescription>
							) : null}
						</DialogHeader>
					</div>

					{/* Onay alanı (e-posta veya değer) */}
					{valueToMatch ? (
						<div className="px-6 pb-6">
							<div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
								<Label
									htmlFor="delete-confirm-input"
									className="flex items-center gap-2 text-sm font-medium text-foreground"
								>
									<Mail className="size-4 text-muted-foreground shrink-0" />
									{confirmInputLabel}
								</Label>
								<Input
									id="delete-confirm-input"
									type={confirmEmail ? "email" : "text"}
									placeholder={valueToMatch}
									value={confirmInput}
									onChange={(e) => setConfirmInput(e.target.value)}
									className={cn(
										"h-10 transition-colors",
										!inputMatches &&
											confirmInput.length > 0 &&
											"border-red-500/60 bg-red-500/5 focus-visible:ring-red-500/50"
									)}
									autoComplete="off"
								/>
								{confirmInput.length > 0 && !inputMatches ? (
									<p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
										<AlertTriangle className="size-3.5 shrink-0" />
										{confirmEmail ? "E-posta adresi eşleşmiyor" : "Değer eşleşmiyor"}
									</p>
								) : null}
							</div>
						</div>
					) : null}

					{/* Alt bölüm: butonlar */}
					<DialogFooter className="flex flex-row gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={loading}
							className="min-w-[110px] flex-1 sm:flex-initial"
						>
							{cancelText}
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirm}
							disabled={!canDelete}
							className="min-w-[110px] gap-2 flex-1 sm:flex-initial"
						>
							{loading ? (
								<>
									<Loader2 className="size-4 animate-spin shrink-0" />
									Siliniyor...
								</>
							) : (
								<>
									<Trash2 className="size-4 shrink-0" />
									{confirmText}
								</>
							)}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
