import { Link, useParams, useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, Pencil, Send, Hash, Type, FileText } from "lucide-react";
import { useGetNotificationById, useSendNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function NotificationDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const notificationId = id ? Number(id) : NaN;
	const { data: notification, isLoading, isError } = useGetNotificationById(notificationId);
	const sendNotification = useSendNotification();

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

	if (isError || !notification) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Bildirim bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/notifications")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	const handleSend = () => {
		sendNotification.mutate(notification.id);
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
					<div className="flex items-center gap-4 min-w-0">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand shrink-0 ring-2 ring-brand-ring">
							<Bell className="size-7" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								{notification.title || "Bildirim detayı"}
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Bildirim bilgileri
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="sm"
						onClick={handleSend}
						disabled={sendNotification.isPending}
						className="gap-2"
					>
						<Send className="size-4" />
						{sendNotification.isPending ? "Gönderiliyor..." : "Gönder"}
					</Button>
					<Button asChild className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
						<Link to={`/notifications/${notification.id}/edit`}>
							<Pencil className="size-4" />
							Düzenle
						</Link>
					</Button>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Bilgiler</CardTitle>
					<CardDescription>Bildirim detayları</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4 sm:col-span-2">
							<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
								<Hash className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="font-mono font-semibold">{notification.id}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4 sm:col-span-2">
							<div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
								<Type className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground">Başlık</p>
								<p className="font-semibold">{notification.title || "—"}</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/50 p-4 sm:col-span-2">
							<div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
								<FileText className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-muted-foreground mb-1">İçerik</p>
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{notification.content || "—"}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
