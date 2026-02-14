import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListPaginationProps {
	/** 0-based mevcut sayfa */
	page: number;
	totalPages: number;
	totalElements: number;
	/** Sayfa değiştiğinde çağrılır (0-based) */
	onPageChange: (page: number) => void;
	/** Sol tarafta gösterilecek metin (örn. "Toplam 5 medya") */
	label?: string;
	className?: string;
}

export function ListPagination({
	page,
	totalPages,
	totalElements,
	onPageChange,
	label,
	className,
}: ListPaginationProps) {
	const hasPrev = page > 0;
	const hasNext = page < totalPages - 1;

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-muted/10",
				className
			)}
		>
			{label && (
				<p className="text-sm text-muted-foreground">{label}</p>
			)}
			<Pagination className="mx-0 w-auto">
				<PaginationContent className="gap-2">
					<PaginationItem>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(Math.max(0, page - 1))}
							disabled={!hasPrev}
							className="gap-1.5"
						>
							<ChevronLeft className="h-4 w-4" />
							Önceki
						</Button>
					</PaginationItem>
					<PaginationItem>
						<span className="text-sm text-muted-foreground px-2">
							Sayfa {page + 1} / {totalPages || 1}
						</span>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
							disabled={!hasNext}
							className="gap-1.5"
						>
							Sonraki
							<ChevronRight className="h-4 w-4" />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
