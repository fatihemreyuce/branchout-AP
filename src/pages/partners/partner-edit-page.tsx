import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, ListOrdered, Loader2, ImagePlus } from "lucide-react";
import { usePartnerById, useUpdatePartner } from "@/hooks/use-partners";
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
import type { PartnerRequest } from "@/types/partners.types";

function getLogoUrl(logo: string): string {
	if (!logo) return "";
	if (logo.startsWith("http") || logo.startsWith("//")) return logo;
	return logo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${logo}` : logo;
}

export default function PartnerEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const partnerId = id ? Number(id) : NaN;

	const { data: partner, isLoading, isError } = usePartnerById(partnerId);
	const updatePartner = useUpdatePartner();

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [orderIndex, setOrderIndex] = useState(1);

	useEffect(() => {
		if (partner) {
			setOrderIndex(Math.max(1, partner.orderIndex));
			if (!logoFile) setLogoPreview(partner.logo ? getLogoUrl(partner.logo) : null);
		}
	}, [partner, logoFile]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setLogoFile(file);
			setLogoPreview(URL.createObjectURL(file));
		} else {
			setLogoFile(null);
			if (logoPreview && !partner?.logo) URL.revokeObjectURL(logoPreview);
			setLogoPreview(partner?.logo ? getLogoUrl(partner.logo) : null);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(partnerId)) return;
		const logoPayload: PartnerRequest["logo"] = logoFile ?? (partner?.logo ?? "");
		updatePartner.mutate(
			{ id: partnerId, request: { logo: logoPayload, orderIndex } },
			{ onSuccess: () => navigate(`/partners/${partnerId}`) }
		);
	};

	if (!id || Number.isNaN(partnerId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz partner ID.</p>
				<Button variant="outline" onClick={() => navigate("/partners")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading || !partner) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="h-40 w-full max-w-md bg-muted animate-pulse rounded-xl" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Partner bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/partners")}>
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
						<Link to={`/partners/${partner.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Pencil className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Partner düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {partner.id} — logo ve sıra güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Partner bilgileri</CardTitle>
					<CardDescription>
						Logoyu değiştirin veya sıra numarasını güncelleyin (1 ve üzeri)
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4">
							<Label className="flex items-center gap-2 text-sm font-medium">
								<ImagePlus className="size-4 text-muted-foreground" />
								Logo
							</Label>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 cursor-pointer hover:border-brand-ring hover:bg-brand-muted transition-colors min-h-[180px]"
							>
								{logoPreview ? (
									<>
										<img
											src={logoPreview}
											alt="Logo önizleme"
											className="max-h-24 w-auto object-contain rounded-lg"
										/>
										<p className="text-sm text-muted-foreground">
											{logoFile ? "Yeni logo seçildi. Değiştirmek için tıklayın." : "Değiştirmek için tıklayın"}
										</p>
									</>
								) : (
									<>
										<ImagePlus className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Logo yüklemek için tıklayın
										</p>
									</>
								)}
							</div>
						</div>

						<div className="max-w-md space-y-2">
							<Label htmlFor="orderIndex" className="flex items-center gap-2 text-sm font-medium">
								<ListOrdered className="size-4 text-muted-foreground" />
								Sıra numarası
							</Label>
							<Input
								id="orderIndex"
								type="number"
								min={1}
								value={orderIndex}
								onChange={(e) => setOrderIndex(Math.max(1, Number(e.target.value) || 1))}
								className="w-32"
							/>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button
								type="submit"
								disabled={updatePartner.isPending}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updatePartner.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Pencil className="size-4" />
								)}
								{updatePartner.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/partners/${partner.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
