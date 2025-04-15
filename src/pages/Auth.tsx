
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const navigate = useNavigate();

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);
      
      if (error) throw error;
      return data.length === 0; // true if username is available
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setUsernameError('');
    
    // Only check availability if username is valid length and we're in signup mode
    if (isSignUp && newUsername && newUsername.length >= 3) {
      const isAvailable = await checkUsernameAvailability(newUsername);
      if (!isAvailable) {
        setUsernameError('This username is already taken');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Final check for username availability before signup
        if (username.length < 3) {
          setUsernameError('Username must be at least 3 characters');
          setLoading(false);
          return;
        }
        
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          setUsernameError('This username is already taken');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Trophy className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to create your account'
              : 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={handleUsernameChange}
                  required={isSignUp}
                  className={usernameError ? "border-destructive" : ""}
                />
                {usernameError && (
                  <Alert variant="destructive" className="py-2 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs ml-2">{usernameError}</AlertDescription>
                  </Alert>
                )}
                {isSignUp && !usernameError && username && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Username must be at least 3 characters
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || (isSignUp && (!!usernameError || username.length < 3))}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setUsernameError('');
              }}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
