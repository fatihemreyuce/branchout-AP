import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
	Users,
	ArrowLeft,
	Loader2,
	ImagePlus,
	Mail,
	UserCircle,
	Linkedin,
	Globe,
	Plus,
	Trash2,
	Languages,
	Eye,
	CheckCircle2,
} from "lucide-react";
import { useTeamMemberById, useUpdateTeamMember } from "@/hooks/use-team-members";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { translateFromTurkish } from "@/utils/translate";
import type { TeamMemberRequest } from "@/types/team.members.types";

type LocalizationItem = TeamMemberRequest["localizations"][number];

type LocalizationFormItem = LocalizationItem & {
	titleSourceTr?: string;
	descriptionSourceTr?: string;
};

function getPhotoUrl(photo: string): string {
	if (!photo) return "";
	if (photo.startsWith("http") || photo.startsWith("//")) return photo;
	return photo.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${photo}` : photo;
}

export default function TeamMemberEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const memberId = id ? Number(id) : NaN;

	const { data: member, isLoading, isError } = useTeamMemberById(memberId);
	const updateTeamMember = useUpdateTeamMember();
	const { data: languagesData } = useLanguages(0, 100, "id,asc");
	const languages = useMemo(() => {
		const raw = languagesData as Record<string, unknown> | undefined;
		const arr = raw?.content ?? raw?.data ?? [];
		const list = Array.isArray(arr) ? arr : [];
		return list.map((x: Record<string, unknown>) => ({
			id: Number(x.id ?? x.Id ?? 0),
			code: String(x.code ?? x.Code ?? ""),
		}));
	}, [languagesData]);

	const [name, setName] = useState("");
	const [linkedinUrl, setLinkedinUrl] = useState("");
	const [email, setEmail] = useState("");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [localizations, setLocalizations] = useState<LocalizationFormItem[]>([]);
	const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

	useEffect(() => {
		if (member) {
			setName(member.name ?? "");
			setLinkedinUrl(member.linkedinUrl ?? "");
			setEmail(member.email ?? "");
			setLocalizations(member.localizations?.length ? [...member.localizations] : []);
			if (!photoFile) setPhotoPreview(member.photo ? getPhotoUrl(member.photo) : null);
		}
	}, [member, photoFile]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPhotoFile(file);
			setPhotoPreview(URL.createObjectURL(file));
		} else {
			setPhotoFile(null);
			if (photoPreview && !member?.photo) URL.revokeObjectURL(photoPreview);
			setPhotoPreview(member?.photo ? getPhotoUrl(member.photo) : null);
		}
	};

	const addLocalization = () => {
		setLocalizations((prev) => [
			...prev,
			{ languageCode: "", title: "", description: "" },
		]);
	};

	const updateLocalization = (idx: number, field: keyof LocalizationFormItem, value: string) => {
		setLocalizations((prev) =>
			prev.map((loc, i) => (i === idx ? { ...loc, [field]: value } : loc))
		);
	};

	const handleTranslate = async (idx: number, field: "title" | "description") => {
		const loc = localizations[idx];
		if (!loc?.languageCode) return;
		const sourceTr = field === "title" ? loc.titleSourceTr : loc.descriptionSourceTr;
		if (!sourceTr?.trim()) return;

		setTranslatingIdx(idx);
		try {
			const translated = await translateFromTurkish(sourceTr, loc.languageCode);
			updateLocalization(idx, field, translated);
		} finally {
			setTranslatingIdx(null);
		}
	};

	const removeLocalization = (idx: number) => {
		setLocalizations((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (Number.isNaN(memberId)) return;

		const photoPayload = photoFile ?? (member?.photo ?? "");
		const payload = {
			name,
			linkedinUrl,
			email,
			photo: photoPayload,
			localizations: localizations
			.filter((l) => l.languageCode || l.title || l.description)
			.map(({ titleSourceTr: _1, descriptionSourceTr: _2, ...rest }) => rest),
		};

		updateTeamMember.mutate(
			{ id: memberId, request: payload },
			{ onSuccess: () => navigate(`/team-members/${memberId}`) }
		);
	};

	if (!id || Number.isNaN(memberId)) {
		return (
			<div className="space-y-6">
				<p className="text-destructive">Geçersiz ekip üyesi ID.</p>
				<Button variant="outline" onClick={() => navigate("/team-members")}>
					Listeye dön
				</Button>
			</div>
		);
	}

	if (isLoading || !member) {
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
				<p className="text-destructive">Ekip üyesi bulunamadı veya bir hata oluştu.</p>
				<Button variant="outline" onClick={() => navigate("/team-members")}>
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
						<Link to={`/team-members/${member.id}`}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand shrink-0">
							<Users className="size-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold tracking-tight truncate">
								Ekip üyesi düzenle
							</h1>
							<p className="text-muted-foreground text-sm mt-0.5">
								ID {member.id} — bilgileri güncelleyin
							</p>
						</div>
					</div>
				</div>
			</div>

			<Card className="w-full border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="border-b border-border/60 bg-muted/20">
					<CardTitle className="text-lg">Ekip üyesi bilgileri</CardTitle>
					<CardDescription>
						Ad, iletişim bilgileri, fotoğraf ve lokalizasyonları güncelleyin
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="space-y-4">
								<Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
									<UserCircle className="size-4 text-muted-foreground" />
									İsim
								</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Ad Soyad"
									required
								/>
							</div>
							<div className="space-y-4">
								<Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
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
						</div>

						<div className="space-y-4">
							<Label htmlFor="linkedinUrl" className="flex items-center gap-2 text-sm font-medium">
								<Linkedin className="size-4 text-muted-foreground" />
								LinkedIn profili
							</Label>
							<Input
								id="linkedinUrl"
								type="url"
								value={linkedinUrl}
								onChange={(e) => setLinkedinUrl(e.target.value)}
								placeholder="https://linkedin.com/in/..."
							/>
						</div>

						<div className="space-y-4">
							<Label className="flex items-center gap-2 text-sm font-medium">
								<ImagePlus className="size-4 text-muted-foreground" />
								Fotoğraf
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
								{photoPreview ? (
									<>
										<img
											src={photoPreview}
											alt="Önizleme"
											className="h-24 w-24 rounded-full object-cover border-2 border-border/60"
										/>
										<p className="text-sm text-muted-foreground">
											{photoFile ? "Yeni fotoğraf seçildi. Değiştirmek için tıklayın." : "Değiştirmek için tıklayın"}
										</p>
									</>
								) : (
									<>
										<ImagePlus className="size-10 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Fotoğraf yüklemek için tıklayın
										</p>
									</>
								)}
							</div>
						</div>

						<div className="space-y-5 border-t border-border/60 pt-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold flex items-center gap-2">
										<Globe className="size-4 text-brand" />
										Lokalizasyonlar
									</h3>
									<p className="text-xs text-muted-foreground mt-0.5">
										Her dil için başlık ve açıklama ekleyin
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addLocalization}
									className="gap-1.5 border-brand-outline text-brand hover:bg-brand-muted"
								>
									<Plus className="size-4" />
									Yeni dil
								</Button>
							</div>

							{localizations.length === 0 ? (
								<button
									type="button"
									onClick={addLocalization}
									className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 hover:border-brand/50 hover:bg-brand-muted/10 p-10 cursor-pointer transition-all group"
								>
									<div className="flex size-14 items-center justify-center rounded-full bg-brand-muted/50 text-brand group-hover:bg-brand-muted transition-colors">
										<Globe className="size-7" />
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">Lokalizasyon ekleyin</p>
										<p className="text-xs text-muted-foreground mt-1">
											Türkçe metni girin ve hedef dil seçerek çeviri yapın
										</p>
									</div>
									<span className="text-xs text-brand font-medium flex items-center gap-1">
										<Plus className="size-3" />
										İlk dil eklemek için tıklayın
									</span>
								</button>
							) : (
								<div className="space-y-4">
									{localizations.map((loc, idx) => (
										<div
											key={idx}
											className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden ring-1 ring-border/40"
										>
											<div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/60">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-muted-foreground">
														Dil #{idx + 1}
													</span>
													{loc.languageCode && (
														<Badge variant="secondary" className="font-mono text-xs">
															{loc.languageCode}
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-1">
													<Select
														value={loc.languageCode}
														onValueChange={(v) => updateLocalization(idx, "languageCode", v)}
													>
														<SelectTrigger className="w-[120px] h-8">
															<SelectValue placeholder="Dil seç" />
														</SelectTrigger>
														<SelectContent>
															{languages.map((lang) => {
																const usedByOther = localizations.some(
																	(l, i) => i !== idx && l.languageCode === lang.code
																);
																return (
																	<SelectItem
																		key={lang.id}
																		value={lang.code}
																		disabled={usedByOther}
																	>
																		{lang.code}
																		{usedByOther && " (seçili)"}
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeLocalization(idx)}
														className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											</div>

											<div className="p-4 space-y-4">
												<div className="space-y-2">
													<Label className="text-xs font-medium">Başlık (Türkçe)</Label>
													<div className="flex gap-2">
														<Input
															value={loc.titleSourceTr ?? ""}
															onChange={(e) => updateLocalization(idx, "titleSourceTr", e.target.value)}
															placeholder="Örn: Yazılım Geliştirici"
															className="flex-1"
														/>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onClick={() => handleTranslate(idx, "title")}
															disabled={!loc.languageCode || !loc.titleSourceTr?.trim() || translatingIdx === idx}
															className="gap-1.5 shrink-0"
														>
															{translatingIdx === idx ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																<Languages className="size-4" />
															)}
															Çevir
														</Button>
													</div>
													{loc.title && (
														<Popover>
															<PopoverTrigger asChild>
																<button
																	type="button"
																	className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-left text-sm hover:bg-emerald-500/10 transition-colors"
																>
																	<CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
																	<span className="truncate flex-1 text-foreground">
																		{loc.title}
																	</span>
																	<Eye className="size-4 text-muted-foreground shrink-0" />
																</button>
															</PopoverTrigger>
															<PopoverContent className="max-w-md" align="start">
																<p className="text-xs font-medium text-muted-foreground mb-1">
																	Çevrilmiş başlık ({loc.languageCode})
																</p>
																<p className="text-sm whitespace-pre-wrap">{loc.title}</p>
															</PopoverContent>
														</Popover>
													)}
												</div>

												<div className="space-y-2">
													<Label className="text-xs font-medium">Açıklama (Türkçe)</Label>
													<div className="flex gap-2 items-start">
														<Textarea
															value={loc.descriptionSourceTr ?? ""}
															onChange={(e) => updateLocalization(idx, "descriptionSourceTr", e.target.value)}
															placeholder="Türkçe açıklama girin..."
															className="min-h-[80px] flex-1 resize-none"
															rows={3}
														/>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onClick={() => handleTranslate(idx, "description")}
															disabled={!loc.languageCode || !loc.descriptionSourceTr?.trim() || translatingIdx === idx}
															className="gap-1.5 shrink-0 self-start"
														>
															{translatingIdx === idx ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																<Languages className="size-4" />
															)}
															Çevir
														</Button>
													</div>
													{loc.description && (
														<Popover>
															<PopoverTrigger asChild>
																<button
																	type="button"
																	className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-left text-sm hover:bg-emerald-500/10 transition-colors"
																>
																	<CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
																	<span className="truncate flex-1 text-foreground min-w-0">
																		{loc.description}
																	</span>
																	<Eye className="size-4 text-muted-foreground shrink-0" />
																</button>
															</PopoverTrigger>
															<PopoverContent className="max-w-md max-h-64 overflow-y-auto" align="start">
																<p className="text-xs font-medium text-muted-foreground mb-1">
																	Çevrilmiş açıklama ({loc.languageCode})
																</p>
																<p className="text-sm whitespace-pre-wrap">{loc.description}</p>
															</PopoverContent>
														</Popover>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
							<Button
								type="submit"
								disabled={updateTeamMember.isPending || !name || !email}
								className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
							>
								{updateTeamMember.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Users className="size-4" />
								)}
								{updateTeamMember.isPending ? "Kaydediliyor..." : "Kaydet"}
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link to={`/team-members/${member.id}`}>İptal</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
