import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useCreateNotificationsSubscribers } from "@/hooks/use-subs-notifications";
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

export default function NotificationSubscriberCreatePage() {
	const navigate = useNavigate();
	const createSubscriber = useCreateNotificationsSubscribers();
	const [email, setEmail] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;
		createSubscriber.mutate(
			{ email: trimmed },
			{ onSuccess: () => navigate("/notification-subscribers") }
		);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/notification-subscribers">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Mail className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Yeni Abone
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Yeni bildirim abonesi ekleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Abone bilgisi</CardTitle>
					<CardDescription>
						E-posta adresini girin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2 max-w-md">
							<Label
								htmlFor="email"
								className="flex items-center gap-2 text-sm font-medium"
							>
								<Mail className="size-4 text-muted-foreground" />
								E-posta
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="ornek@email.com"
								required
							/>
						</div>
						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button
								type="submit"
								disabled={createSubscriber.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createSubscriber.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Mail className="size-4" />
								)}
								{createSubscriber.isPending ? "Ekleniyor..." : "Ekle"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/notification-subscribers">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
