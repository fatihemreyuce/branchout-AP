import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Loader2, Code } from "lucide-react";
import { useCreateLanguage } from "@/hooks/use-languages";
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

export default function LanguageCreatePage() {
	const navigate = useNavigate();
	const createLanguage = useCreateLanguage();
	const [code, setCode] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createLanguage.mutate(
			{ code },
			{ onSuccess: () => navigate("/languages") }
		);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/languages">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
							<BookOpen className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Yeni Dil
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Yeni bir dil kodu ekleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Dil bilgisi</CardTitle>
					<CardDescription>
						Dil kodunu girin (örn. tr, en, de)
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="max-w-md space-y-2">
							<Label htmlFor="code" className="flex items-center gap-2 text-sm font-medium">
								<Code className="size-4 text-muted-foreground" />
								Dil kodu
							</Label>
							<div className="relative">
								<Code className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									id="code"
									value={code}
									onChange={(e) => setCode(e.target.value.trim())}
									placeholder="tr"
									required
									className="pl-9"
									maxLength={20}
								/>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button type="submit" disabled={createLanguage.isPending} className="gap-2">
								{createLanguage.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<BookOpen className="size-4" />
								)}
								{createLanguage.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/languages">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
