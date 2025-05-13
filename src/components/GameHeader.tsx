import { toast } from "@/hooks/use-toast";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { SettingsDialog } from "./settings/SettingsDialog";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import avatarImg from "@/assets/avatar.jpg";

const GameHeader = () => {
  const { state } = useGame();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            to={"/"}
            className="text-4xl font-bold text-[#e39137] hover:scale-105 transition-transform ml-10 cursor-default"
          >
            PORTFOLIO PANIC
          </Link>
          <span className="text-[#8594a8] px-3 py-1 text-lg animate-pulse">
            Round {state.round}/10
          </span>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    toast({
                      title: "Notifications",
                      description:
                        "All notifications are currently shown in the news panel",
                      duration: 3000,
                    });
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110 transform" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1F2C] border border-white/10">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SettingsDialog />

          <Avatar>
            <AvatarImage src={avatarImg} alt="user avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
