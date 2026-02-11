/**
 * Çeviri: .env'deki VITE_GOOGLE_TRANSLATE_API_KEY ile Google Translate API kullanır
 * tr -> hedef dil
 */
export async function translateFromTurkish(
	text: string,
	targetLang: string
): Promise<string> {
	const t = text?.trim();
	if (!t) return "";
	if (targetLang.toLowerCase() === "tr") return t;

	// 1) Backend endpoint - CORS yok, API key backend'de güvende
	try {
		const res = await fetch(
			`/api/v1/translate?q=${encodeURIComponent(t)}&source=tr&target=${targetLang}`
		);
		if (res.ok) {
			const data = (await res.json()) as { translatedText?: string };
			if (data.translatedText) return data.translatedText;
		}
	} catch {
		// backend yoksa devam
	}

	// 2) MyMemory - doğrudan CORS destekliyor (200 OK)
	const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=tr|${targetLang}`;
	const urls = [apiUrl, `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`];
	for (const url of urls) {
		try {
			const res = await fetch(url);
			const raw = await res.text();
			const data = JSON.parse(raw) as {
				responseData?: { translatedText?: string };
				response?: { translatedText?: string };
			};
			const translated =
				data.responseData?.translatedText ?? data.response?.translatedText;
			if (translated) return translated;
		} catch {
			continue;
		}
	}

	// 3) Google API (403 veriyorsa backend'de kullanın)
	const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined;
	if (apiKey) {
		try {
			const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(t)}&target=${targetLang}&source=tr`;
			const res = await fetch(url);
			if (res.ok) {
				const data = (await res.json()) as { data?: { translations?: { translatedText: string }[] } };
				const translated = data.data?.translations?.[0]?.translatedText;
				if (translated) return decodeHtmlEntities(translated);
			}
		} catch {
			// fallback
		}
	}
	return t;
}

function decodeHtmlEntities(s: string): string {
	const doc = typeof document !== "undefined" ? document : null;
	if (doc) {
		const el = doc.createElement("textarea");
		el.innerHTML = s;
		return el.value;
	}
	return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
