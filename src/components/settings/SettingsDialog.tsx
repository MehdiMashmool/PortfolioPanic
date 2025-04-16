
import { useNavigate } from 'react-router-dom';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '../ui/button';

export const SettingsDialog = () => {
  const navigate = useNavigate();
  const [autoStartNextRound, setAutoStartNextRound] = useLocalStorage('autoStartNextRound', false);
  const [showPopups, setShowPopups] = useLocalStorage('showPopups', true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white hover:scale-110 transform transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-gray-800 animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Game Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors">
            <Label htmlFor="auto-start" className="text-white cursor-pointer">
              Auto-start next round
            </Label>
            <Switch
              id="auto-start"
              checked={autoStartNextRound}
              onCheckedChange={setAutoStartNextRound}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors">
            <Label htmlFor="show-popups" className="text-white cursor-pointer">
              Show popups
            </Label>
            <Switch
              id="show-popups"
              checked={showPopups}
              onCheckedChange={setShowPopups}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <Button 
            variant="destructive" 
            className="w-full font-semibold tracking-wide hover:bg-red-600/90 transition-colors"
            onClick={() => navigate('/')}
          >
            Return to Main Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
