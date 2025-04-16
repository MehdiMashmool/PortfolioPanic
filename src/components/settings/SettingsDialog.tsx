
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
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Game Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-start" className="text-white">
              Auto-start next round
            </Label>
            <Switch
              id="auto-start"
              checked={autoStartNextRound}
              onCheckedChange={setAutoStartNextRound}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-popups" className="text-white">
              Show popups
            </Label>
            <Switch
              id="show-popups"
              checked={showPopups}
              onCheckedChange={setShowPopups}
            />
          </div>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Return to Main Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
