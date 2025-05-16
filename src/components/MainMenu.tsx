import cityImg from "@/assets/background.avif";
import { toast } from "@/hooks/use-toast";
import { Award, Info, LogIn, LogOut, Trophy, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import avatarImg from "@/assets/avatar.jpg";

const MainMenu = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUsername(session.user.user_metadata?.username || "");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUsername(session.user.user_metadata?.username || "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#041e42] relative overflow-hidden">
      <img
        className="fixed z-0 inset-0 w-screen h-screen object-cover object-right select-none"
        src={cityImg}
        alt="background"
      />

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col md:flex-row gap-8 items-center justify-between pt-12">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-6xl md:text-7xl font-bold text-[#ff9800] mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              PORTFOLIO
              <br />
              PANIC
            </h1>

            <h2 className="text-white text-xl md:text-2xl mb-8 max-w-md">
              Master the markets before time runs out
            </h2>

            <button
              onClick={() => navigate("/game")}
              className="bg-[#ff9800] hover:bg-[#f57c00] text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors mb-12"
            >
              Play Now
            </button>

            <div className="mb-8">
              <h3 className="text-[#ff9800] text-3xl font-bold mb-4">
                How to Win
              </h3>
              <ul className="text-white space-y-3">
                <li className="flex items-start">
                  <span className="text-[#ff9800] mr-2">•</span>
                  <span>Buy low and sell high to maximize portfolio value</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff9800] mr-2">•</span>
                  <span>Pay attention to market and trading opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff9800] mr-2">•</span>
                  <span>Diversify your investments to manage risks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff9800] mr-2">•</span>
                  <span>Complete all 10 rounds with maximum profits</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
            <div className=" w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#ff9800] overflow-hidden mb-4">
              <img
                src={avatarImg}
                alt="Character avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full max-w-md space-y-4">
              <button
                onClick={() => navigate("/how-to-play")}
                className="w-full bg-[#0a2e5c] hover:bg-[#0d3b76] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors"
              >
                <div className="flex items-center">
                  <Info className="mr-2" />
                  <span>How to Play</span>
                </div>
                <span className="text-[#ff9800]">→</span>
              </button>

              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full bg-[#0a2e5c] hover:bg-[#0d3b76] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors"
              >
                <div className="flex items-center">
                  <Trophy className="mr-2" />
                  <span>Leaderboard</span>
                </div>
                <span className="text-[#ff9800]">→</span>
              </button>

              <button
                onClick={() => navigate("/achievements")}
                disabled={!isAuthenticated}
                className="w-full bg-[#0a2e5c] hover:bg-[#0d3b76] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Award className="mr-2" />
                  <span>Achievements</span>
                </div>
                <span className="text-[#ff9800]">→</span>
              </button>

              {/* <button className="w-full bg-[#0a2e5c] hover:bg-[#0d3b76] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors">
                <div className="flex items-center">
                  <User className="mr-2" />
                  <span>Sign In</span>
                </div>
                <span className="text-[#ff9800]">→</span>
              </button> */}

              {isAuthenticated ? (
                <button
                  className="w-full bg-[#b11818] hover:bg-[#911b1b] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2" />
                    <span>Sign Out</span>
                  </div>
                </button>
              ) : (
                <button
                  className="w-full bg-[#0a2e5c] hover:bg-[#0d3b76] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-between transition-colors"
                  onClick={() => navigate("/auth")}
                >
                  <div className="flex items-center">
                    <LogIn className="mr-2" />
                    <span>Sign In</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </main>

        <footer className="text-center text-gray-400 py-4">
          Version 1.0.0
        </footer>
      </div>
    </div>
  );
};

export default MainMenu;
