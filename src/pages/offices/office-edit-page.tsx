import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, Building, MapPin, Phone, Loader2 } from "lucide-react";
import { useGetOffice, useUpdateOffice } from "@/hooks/use-offices";
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

export default function OfficeEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const officeId = id ? Number(id) : NaN;
	const { data: office, isLoading, isError } = useGetOffice(officeId);
	const updateOffice = useUpdateOffice();

	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");

	useEffect(() => {
		if (office) {
			setName(office.name);
			setAddress(office.address);
			setPhoneNumber(office.phoneNumber);
		}
	}, [office]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(officeId)) return;
		updateOffice.mutate(
			{ id: officeId, office: { name, address, phoneNumber } },
			{ onSuccess: () => navigate(`/offices/${officeId}`) }
		);
	};

	if (!id || Number.isNaN(officeId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz ofis ID.</p>
				<Button variant="outline" onClick={() => navigate("/offices")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading || !office) {
		return (
			<div className="space-y-6">
				<div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="h-10 w-full bg-muted animate-pulse rounded" />
							<div className="h-10 w-full bg-muted animate-pulse rounded" />
							<div className="h-10 w-2/3 bg-muted animate-pulse rounded" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Ofis bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/offices")}>
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
						<Link to={`/offices/${office.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Pencil className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Ofisi düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								{office.name} bilgilerini güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/30">
					<CardTitle className="text-lg">Ofis bilgileri</CardTitle>
					<CardDescription>
						Değişiklikleri yapıp kaydedin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
									<Building className="size-4 text-muted-foreground" />
									Ofis adı
								</Label>
								<div className="relative">
									<Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Merkez Ofis"
										required
										className="pl-9"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
									<MapPin className="size-4 text-muted-foreground" />
									Adres
								</Label>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="address"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										placeholder="Örnek Mah. Cadde No: 1"
										required
										className="pl-9"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium">
									<Phone className="size-4 text-muted-foreground" />
									Telefon
								</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="phoneNumber"
										type="tel"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										placeholder="+90 212 000 00 00"
										required
										className="pl-9"
									/>
								</div>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
							<Button type="submit" disabled={updateOffice.isPending} className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
								{updateOffice.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Pencil className="size-4" />
								)}
								{updateOffice.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/offices/${office.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
