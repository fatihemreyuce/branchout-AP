import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, Loader2, Type, FileText } from "lucide-react";
import { useGetNotificationById, useUpdateNotification } from "@/hooks/use-notifications";
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

export default function NotificationEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const notificationId = id ? Number(id) : NaN;
	const { data: notification, isLoading, isError } = useGetNotificationById(notificationId);
	const updateNotification = useUpdateNotification();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	useEffect(() => {
		if (notification) {
			setTitle(notification.title ?? "");
			setContent(notification.content ?? "");
		}
	}, [notification]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(notificationId)) return;
		updateNotification.mutate(
			{
				id: notificationId,
				request: { title: title.trim(), content: content.trim() },
			},
			{ onSuccess: () => navigate(`/notifications/${notificationId}`) }
		);
	};

	if (!id || Number.isNaN(notificationId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz bildirim ID.</p>
				<Button variant="outline" onClick={() => navigate("/notifications")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading || !notification) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="h-10 max-w-md bg-muted animate-pulse rounded" />
							<div className="h-24 bg-muted animate-pulse rounded" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Bildirim bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/notifications")}>
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
						<Link to={`/notifications/${notification.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Pencil className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Bildirimi düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								{notification.title || "Bildirim"} bilgisini güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Bildirim bilgisi</CardTitle>
					<CardDescription>
						Başlık ve içeriği güncelleyin
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
								disabled={updateNotification.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updateNotification.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Pencil className="size-4" />
								)}
								{updateNotification.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/notifications/${notification.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
