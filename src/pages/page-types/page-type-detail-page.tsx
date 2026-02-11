import { Link, useParams, useNavigate } from "react-router-dom";
import { FileType, ArrowLeft, Pencil, Type, Hash } from "lucide-react";
import { useGetPageTypeById } from "@/hooks/use-page-type";
import { Button } from "@/components/ui/button";
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

export default function PageTypeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const ptId = id ? Number(id) : NaN;
	const { data: rawData, isLoading, isError } = useGetPageTypeById(ptId);
	const raw = rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null;
	const rawItem = raw != null && (raw.data !== undefined || raw.content !== undefined)
		? (raw.data ?? raw.content)
		: rawData;
	const pt = rawItem != null ? normalizePageType(rawItem) : null;

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
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="h-24 bg-muted animate-pulse rounded-lg" />
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
						<Link to="/page-types">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring relative overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<FileType className="size-7 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{pt.type || `Sayfa Tipi #${pt.id}`}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {pt.id} · Sayfa tipi detayı
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/page-types/${pt.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
								<Hash className="size-4" />
							</span>
							Temel bilgiler
						</CardTitle>
						<CardDescription>Sayfa tipi kimlik ve ad bilgileri</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						<dl className="space-y-4">
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</dt>
								<dd className="mt-1 font-mono text-sm font-medium">{pt.id}</dd>
							</div>
							<div>
								<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tip</dt>
								<dd className="mt-1 text-sm font-medium">{pt.type || "—"}</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-border/60 shadow-sm">
					<CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
								<Type className="size-4" />
							</span>
							Özet
						</CardTitle>
						<CardDescription>Sayfa tipi tanımı</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						<p className="text-sm text-muted-foreground">
							Bu sayfa tipi &quot;{pt.type || "—"}&quot; değeri ile tanımlanır. Bileşenler ve sayfalar bu tipe referans verebilir.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
