import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FileType, ArrowLeft, Loader2, Type, Pencil } from "lucide-react";
import { useGetPageTypeById, useUpdatePageType } from "@/hooks/use-page-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import type { PageTypeResponse } from "@/types/page.type.types";

function normalizePageType(data: unknown): PageTypeResponse | null {
	if (!data || typeof data !== "object") return null;
	const item = data as Record<string, unknown>;
	return {
		id: Number(item.id ?? item.Id ?? 0),
		type: String(item.type ?? item.Type ?? ""),
	};
}

export default function PageTypeEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const ptId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = useGetPageTypeById(ptId);
	const updatePageType = useUpdatePageType();

	const raw = rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawItem = raw != null && (raw?.data !== undefined || raw?.content !== undefined)
		? (raw.data ?? raw.content)
		: rawData;
	const pt = rawItem != null ? normalizePageType(rawItem) : null;

	const [type, setType] = useState("");
	const lastSyncedId = useRef<number | null>(null);

	useEffect(() => {
		if (pt && lastSyncedId.current !== pt.id) {
			lastSyncedId.current = pt.id;
			setType(pt.type ?? "");
		}
	}, [pt]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(ptId) || !pt) return;
		const payload = { type: type.trim() || "page-type" };
		updatePageType.mutate(
			{ id: ptId, pageType: payload },
			{ onSuccess: () => navigate(`/page-types/${pt.id}`) }
		);
	};

	if (!id || Number.isNaN(ptId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz sayfa tipi ID.</p>
				<Button variant="outline" onClick={() => navigate("/page-types")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="h-10 bg-muted animate-pulse rounded-lg" />
							<div className="h-24 bg-muted animate-pulse rounded-lg" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !pt) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Sayfa tipi bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/page-types")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to={`/page-types/${pt.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<FileType className="size-6 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Sayfa Tipini Düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								{pt.type || `Sayfa tipi #${pt.id}`} · Bilgileri güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Sayfa tipi bilgileri</CardTitle>
					<CardDescription>Tip adını güncelleyin</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4">
							<Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
								<Type className="size-4 text-muted-foreground" />
								Tip
							</Label>
							<Input
								id="type"
								value={type}
								onChange={(e) => setType(e.target.value)}
								placeholder="Örn: home, about, contact"
								className="max-w-md"
								required
							/>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
							<Button
								type="submit"
								disabled={updatePageType.isPending || !type.trim()}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updatePageType.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Pencil className="size-4" />
								)}
								{updatePageType.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/page-types/${pt.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
