import { Badge } from "@/components/ui/badge";

interface JurisdictionBadgeProps {
  jurisdiction: string;
  className?: string;
}

export function JurisdictionBadge({ jurisdiction, className = "" }: JurisdictionBadgeProps) {
  const getBadgeColors = () => {
    switch (jurisdiction) {
      case "EU":
        return "bg-[#033993] text-[#FFCC00] hover:bg-[#033993]/90 border-[#033993]";
      case "US":
        return "bg-[#B31942] text-white hover:bg-[#B31942]/90 border-[#B31942]";
      case "Arabic":
        return "bg-[#007A3D] text-white hover:bg-[#007A3D]/90 border-[#007A3D]";
      case "Morocco":
        return "bg-[#C1272D] text-white hover:bg-[#C1272D]/90 border-[#C1272D]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLabel = () => {
    switch (jurisdiction) {
      case "Morocco":
        return "MAOS 🇲🇦";
      default:
        return jurisdiction;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-medium ${getBadgeColors()} ${className}`}
      data-testid={`badge-jurisdiction-${jurisdiction.toLowerCase()}`}
    >
      {getLabel()}
    </Badge>
  );
}
