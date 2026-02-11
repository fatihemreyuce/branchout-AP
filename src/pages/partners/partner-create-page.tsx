import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Handshake, ArrowLeft, Loader2, ImagePlus, ListOrdered } from "lucide-react";
import { useCreatePartner } from "@/hooks/use-partners";
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

export default function PartnerCreatePage() {
	const navigate = useNavigate();
	const createPartner = useCreatePartner();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [orderIndex, setOrderIndex] = useState(1);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setLogoFile(file);
			setLogoPreview(URL.createObjectURL(file));
		} else {
			setLogoFile(null);
			if (logoPreview) URL.revokeObjectURL(logoPreview);
			setLogoPreview(null);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!logoFile) return;
		createPartner.mutate(
			{ logo: logoFile, orderIndex },
			{ onSuccess: () => navigate("/partners") }
		);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="shrink-0">
						<Link to="/partners">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Handshake className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Yeni Partner
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								Yeni bir partner logosu ekleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Partner bilgileri</CardTitle>
					<CardDescription>
						Logo yükleyin ve listeleme sırasını belirleyin (1 ve üzeri)
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
											alt="Önizleme"
											className="max-h-24 w-auto object-contain rounded-lg"
										/>
										<p className="text-sm text-muted-foreground">
											Değiştirmek için tıklayın
										</p>
									</>
								) : (
									<>
										<ImagePlus className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Logo yüklemek için tıklayın veya sürükleyin
										</p>
										<p className="text-xs text-muted-foreground">
											PNG, JPG, SVG (önerilir)
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
							<p className="text-xs text-muted-foreground">
								Listede görüneceği sıra (1 ve üzeri, küçük numara önce)
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button
								type="submit"
								disabled={createPartner.isPending || !logoFile}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{createPartner.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Handshake className="size-4" />
								)}
								{createPartner.isPending ? "Oluşturuluyor..." : "Oluştur"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to="/partners">İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
