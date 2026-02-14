import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, Loader2, Type, FileText } from "lucide-react";
import { useCreateNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function NotificationCreatePage() {
	const navigate = useNavigate();
	const createNotification = useCreateNotification();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createNotification.mutate(
			{ title: title.trim(), content: content.trim() },
			{ onSuccess: () => navigate("/notifications") }
		);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/notifications">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Bell className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Yeni Bildirim
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Yeni bir bildirim oluşturun
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Bildirim bilgisi</CardTitle>
					<CardDescription>
						Başlık ve içerik girin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
								<Type className="size-4 text-muted-foreground" />
								Başlık
							</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Bildirim başlığı"
								required
								className="max-w-md"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="content" className="flex items-center gap-2 text-sm font-medium">
								<FileText className="size-4 text-muted-foreground" />
								İçerik
							</Label>
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Bildirim içeriği..."
								rows={5}
								className="resize-y min-h-[120px]"
							/>
						</div>
						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button
								type="submit"
								disabled={createNotification.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createNotification.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Bell className="size-4" />
								)}
								{createNotification.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/notifications">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
