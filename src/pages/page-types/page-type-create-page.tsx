import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileType, ArrowLeft, Loader2, Type, Puzzle } from "lucide-react";
import { useCreatePageType } from "@/hooks/use-page-type";
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

export default function PageTypeCreatePage() {
	const navigate = useNavigate();
	const createPageType = useCreatePageType();
	const [type, setType] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const payload = { type: type.trim() || "page-type" };
		createPageType.mutate(payload, {
			onSuccess: () => navigate("/page-types"),
		});
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/page-types">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0 overflow-hidden">
							<BorderBeam size={50} duration={8} />
							<FileType className="size-6 relative z-10" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">Yeni Sayfa Tipi</h1>
							<p className="text-muted-foreground text-sm mt-0.5">Yeni bir sayfa şablonu oluşturun</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="relative w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Sayfa tipi bilgileri</CardTitle>
					<CardDescription>Tip adını belirleyin (örn: home, about, contact)</CardDescription>
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
								disabled={createPageType.isPending || !type.trim()}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createPageType.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Puzzle className="size-4" />
								)}
								{createPageType.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/page-types">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
