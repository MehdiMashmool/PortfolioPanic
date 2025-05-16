import cityImg from "@/assets/background.avif";
import avatarImg from "@/assets/avatar.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeftRight,
  Shield,
  TrendingUp,
  Newspaper,
  HelpCircle,
  Crown,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from "@/contexts/GameContext";

export default function StartScreen() {
  const { startGame } = useGame();

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        className="fixed z-0 inset-0 w-screen h-screen object-cover object-right select-none pointer-events-none"
        src={cityImg}
        alt="background"
      />

      <main className="container relative z-30 mx-auto flex min-h-screen flex-col px-4 py-8 md:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex flex-col space-y-8 lg:w-1/2">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-[#ffc547] sm:text-6xl md:text-7xl">
              PORTFOLIO PANIC
            </h1>
            <p className="text-xl md:text-2xl">
              A financial trading simulation game
            </p>
          </div>

          <div className="space-y-4">
            <FeatureCard
              icon={<ArrowLeftRight className="size-8" />}
              title="Trade Assets"
              description="Buy low and sell high across multiple asset classes."
              iconBg="bg-emerald-600"
            />

            <FeatureCard
              icon={<Shield className="size-8" />}
              title="Manage Risk"
              description="Diversify your portfolio to mitigate potential losses"
              iconBg="bg-blue-600"
            />

            <FeatureCard
              icon={<TrendingUp className="size-8" />}
              title="Build Wealth"
              description="Grow your initial $10,000 starting portfolio."
              iconBg="bg-cyan-600"
            />

            <FeatureCard
              icon={<Newspaper className="size-8" />}
              title="React to News"
              description="Aim to maximize your total portfolio value"
              iconBg="bg-red-600"
            />
          </div>

          <Button
            onClick={startGame}
            className="w-full max-w-xs bg-[#ffc547] text-lg font-bold text-black hover:bg-[#e6b03f] sm:text-xl md:h-14"
          >
            Start Game
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center space-y-6 lg:mt-0 lg:w-1/2">
          <Avatar className="h-32 w-32 border-4 border-[#e74c3c] bg-[#e74c3c]">
            <AvatarImage src={avatarImg} alt="User avatar" />
            <AvatarFallback className="bg-[#e74c3c] text-4xl">U</AvatarFallback>
          </Avatar>

          <div className="w-full space-y-4 md:max-w-md">
            <MenuCard
              icon={<HelpCircle className="size-8" />}
              title="Trade Assets"
            />

            <MenuCard icon={<Crown className="size-8" />} title="Manage Risk" />

            <MenuCard
              icon={<DollarSign className="size-8" />}
              title="React to News"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, iconBg }) {
  return (
    <div className="flex items-start space-x-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#ffc547] md:text-2xl">
          {title}
        </h3>
        <p className="text-sm text-gray-200 md:text-base">{description}</p>
      </div>
    </div>
  );
}

function MenuCard({ icon, title }) {
  return (
    <Card className="flex items-center space-x-4 bg-[#0c1e56]/80 p-6 text-white backdrop-blur-sm border-2 border-blue-800">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-800/20 text-[#ffc547]`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
    </Card>
  );
}
