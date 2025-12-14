import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isSignup = mode === 'signup';
    const url = isSignup ? '/api/auth/signup' : '/api/auth/login';
    const body = isSignup
      ? { username, password, email, phoneNumber }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        login(data);
        onClose();
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Enter your credentials to log in.'
              : 'Create an account to get started.'}
          </DialogDescription>
        </DialogHeader>
        <div className="text-center mb-4">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Button variant="link" onClick={() => onSwitchMode('signup')} className="p-0 h-auto">
                Sign Up
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Button variant="link" onClick={() => onSwitchMode('login')} className="p-0 h-auto">
                Log In
              </Button>
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                {/* TERMS & CONDITIONS CHECKBOX WITH SCROLLABLE TEXT */}
                <div className="col-span-4 flex items-start gap-3 mt-4">
                  <Checkbox
                    id="terms"
                    checked={termsAgreed}
                    onCheckedChange={(checked) => setTermsAgreed(checked === true)}
                    className={`mt-1 flex-shrink-0 ${
                      termsAgreed
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-400 bg-gray-100'
                    }`}
                  />
                  <div className="flex flex-col gap-2 flex-1">
                    <div
                      className={`h-[2.5rem] overflow-y-auto text-sm leading-relaxed border rounded px-2 py-1 transition-colors ${
                        termsAgreed
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-400 bg-gray-100'
                      }`}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: termsAgreed ? '#f97316 #e5e7eb' : '#9ca3af #e5e7eb',
                      }}
                    >
                      <p
                        className={`cursor-pointer transition-colors ${
                          termsAgreed
                            ? 'text-orange-500 hover:text-orange-600'
                            : 'text-gray-500 hover:text-orange-500'
                        }`}
                      >
                        By checking this box, you agree to receive emails and/or text messages from us. Your email
                        will be used for future password recovery measures and updates from the union; while your
                        phone number will be used for future verification (required to gain access to the uminion
                        union website) along with some union updates. Standard messaging rates may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={mode === 'signup' && !termsAgreed}
              className={`${
                mode === 'signup' && !termsAgreed
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {mode === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
