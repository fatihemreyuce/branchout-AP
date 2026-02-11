import { Link, useParams, useNavigate } from "react-router-dom";
import { Languages, ArrowLeft, Pencil, Code, Hash } from "lucide-react";
import { useLanguageById } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function LanguageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const languageId = id ? Number(id) : NaN;
	const { data: language, isLoading, isError } = useLanguageById(languageId);

	if (!id || Number.isNaN(languageId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz dil ID.</p>
				<Button variant="outline" onClick={() => navigate("/languages")}>
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
							<div className="h-20 bg-muted animate-pulse rounded-lg" />
							<div className="h-20 bg-muted animate-pulse rounded-lg" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !language) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Dil bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/languages")}>
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
						<Link to="/languages">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<Languages className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{language.code}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Dil detayları
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="gap-2 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
					<Link to={`/languages/${language.id}/edit`}>
						<Pencil className="size-4" />
						Düzenle
					</Link>
				</Button>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Bilgiler</CardTitle>
					<CardDescription>Dil kimlik bilgisi</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
								<Code className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Dil kodu</p>
								<p className="font-semibold">{language.code}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/50 p-4">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{language.id}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
