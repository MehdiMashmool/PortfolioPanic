import React, { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { getNewsSentimentClass } from "../utils/newsGenerator";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface NewsPanelProps {
  onAssetClick?: (id: string, name: string) => void;
  showLimit?: number;
  activeView: "cards" | "compact";
}

const NewsPanel: React.FC<NewsPanelProps> = ({
  onAssetClick,
  showLimit = 0,
  activeView,
}) => {
  const { state } = useGame();
  const news = state?.news || [];
  const assets = state?.assets || [];

  const [expanded, setExpanded] = useState(false);

  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  const visibleNews =
    showLimit > 0 && !expanded ? sortedNews.slice(0, showLimit) : sortedNews;

  const getImpactColor = (sentiment: string) => {
    if (sentiment === "positive") return "text-green-300";
    if (sentiment === "negative") return "text-red-300";
    return "text-blue-300";
  };

  const getImpactIndicator = (
    magnitude: number,
    sentiment: "positive" | "negative" | "neutral"
  ) => {
    if (magnitude >= 0.7) {
      return (
        <span className="animate-pulse">
          {sentiment === "positive" ? (
            <TrendingUp size={16} className="text-profit" />
          ) : sentiment === "negative" ? (
            <TrendingDown size={16} className="text-loss" />
          ) : (
            <AlertTriangle size={16} className="text-warning" />
          )}
        </span>
      );
    } else if (magnitude >= 0.4) {
      return (
        <>
          {sentiment === "positive" ? (
            <TrendingUp size={16} className="text-profit" />
          ) : sentiment === "negative" ? (
            <TrendingDown size={16} className="text-loss" />
          ) : (
            <AlertTriangle size={16} className="text-warning" />
          )}
        </>
      );
    } else {
      return <Info size={16} className="text-neutral" />;
    }
  };

  const renderImpactedAssets = (item) => {
    if (!item?.impactedAssets?.length) return null;

    const displayedAssets = item.impactedAssets.slice(0, 5);
    const overflowAssets = item.impactedAssets.slice(5);

    return (
      <div className="mt-1.5 flex flex-wrap gap-1">
        {displayedAssets.map((assetId) => {
          const asset = assets.find((a) => a.id === assetId);
          if (!asset) return null;

          return (
            <Badge
              key={assetId}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded cursor-pointer hover:scale-110",
                asset.color === "stock"
                  ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900"
                  : asset.color === "commodity"
                  ? "bg-amber-900/50 text-amber-300 hover:bg-amber-900"
                  : asset.color === "crypto"
                  ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900"
                  : "bg-gray-900/50 text-gray-300 hover:bg-gray-900"
              )}
              onClick={() => {
                try {
                  onAssetClick?.(assetId, asset.name);
                } catch (err) {
                  console.warn("Asset click failed:", err);
                }
              }}
            >
              {asset.ticker}
            </Badge>
          );
        })}

        {overflowAssets.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <Badge className="text-xs border px-1.5 py-0 h-5 bg-gray-800 text-gray-300 border-gray-700 cursor-pointer">
                  +{overflowAssets.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] flex flex-wrap gap-1">
                {overflowAssets.map((assetId) => {
                  const asset = assets.find((a) => a.id === assetId);
                  if (!asset) return null;

                  return (
                    <Badge
                      key={assetId}
                      className={cn(
                        "text-xs border px-1.5 py-0 h-5",
                        asset.color === "stock"
                          ? "bg-blue-900/50 text-blue-300"
                          : asset.color === "commodity"
                          ? "bg-amber-900/50 text-amber-300"
                          : asset.color === "crypto"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-gray-900/50 text-gray-300"
                      )}
                    >
                      {asset.ticker}
                    </Badge>
                  );
                })}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  if (sortedNews.length === 0) {
    return (
      <div className="text-center py-4 text-neutral">No market news yet.</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow pr-2 px-2">
        <div
          className={`grid gap-2 ${
            activeView === "compact" ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
          }`}
        >
          {visibleNews.map((item) => {
            const date = new Date(item.timestamp);
            const timeString = isNaN(date.getTime())
              ? "Invalid date"
              : date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

            const sentiment = ["positive", "negative"].includes(item.sentiment)
              ? item.sentiment
              : "neutral";
            const isHighImpact = item.magnitude >= 0.7;

            if (activeView === "cards") {
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "flex-shrink-0  border bg-[#131729] border-[#2a3252] overflow-hidden",
                    sentiment === "positive"
                      ? "border-l-4 border-l-green-500"
                      : sentiment === "negative"
                      ? "border-l-4 border-l-red-500"
                      : ""
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className={cn(
                          "font-bold text-white",
                          isHighImpact ? getImpactColor(sentiment) : ""
                        )}
                      >
                        {item.title}
                        {isHighImpact && (
                          <Badge className="ml-2 bg-red-900 text-red-300 hover:bg-red-900">
                            CRITICAL
                          </Badge>
                        )}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">{item.content}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeString}
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs mr-1">Impact:</span>
                        <Progress
                          value={item.magnitude * 100}
                          className="h-1.5 w-44 bg-opacity-50"
                        />
                      </div>
                    </div>

                    {renderImpactedAssets(item)}
                  </CardContent>
                </Card>
              );
            }

            // compact view:
            return (
              <div
                key={item.id}
                className={`p-2 border-l-4 ${getNewsSentimentClass(
                  sentiment
                )} border rounded-r-md hover:shadow-lg transition-all duration-300 ${
                  isHighImpact ? "scale-[1.01]" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className={`font-semibold text-lg mb-1 flex items-center gap-1 ${
                        isHighImpact ? getImpactColor(sentiment) : ""
                      }`}
                    >
                      {isHighImpact && (
                        <Zap size={14} className="animate-pulse" />
                      )}
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral leading-tight">
                      {item.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-neutral whitespace-nowrap">
                      {timeString}
                    </span>
                    {isHighImpact && (
                      <span className="text-[10px] font-bold bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-sm mt-1">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[10px] text-neutral">Impact:</span>
                  <Progress
                    value={item.magnitude * 100}
                    className="h-1.5 bg-opacity-40"
                  />
                </div>
                {renderImpactedAssets(item)}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {showLimit > 0 && sortedNews.length > showLimit && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-neutral hover:bg-white/5 rounded-none border-t border-white/5"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              <ChevronUp size={12} className="mr-1" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown size={12} className="mr-1" /> Show More (
              {sortedNews.length - showLimit})
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default NewsPanel;
