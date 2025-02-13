import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { TypewriterAnimation } from '@/components/TypewriterAnimation';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { SocialShareButton } from '@/components/SocialShareButton';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: '',
    referralCode: searchParams.get('ref') || ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [personalReferralCode, setPersonalReferralCode] = useState('');
  const [totalSignups, setTotalSignups] = useState(0);

  // Subscribe to realtime updates for total signups
  useEffect(() => {
    const channel = supabase
      .channel('waitlist_count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waitlist' },
        () => {
          fetchTotalSignups();
        }
      )
      .subscribe();

    fetchTotalSignups();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTotalSignups = async () => {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact' });
    setTotalSignups(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) throw error;

      const referralCode = data;
      
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            city: formData.city,
            referral_code: referralCode,
            referred_by: formData.referralCode || null
          }
        ]);

      if (insertError) throw insertError;

      setPersonalReferralCode(referralCode);
      setIsSubmitted(true);
      toast({
        title: "Welcome to innercircle!",
        description: "Your exclusive access has been registered. Share with friends to climb the ranks!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(personalReferralCode);
    toast({
      title: "Copied!",
      description: "Your referral code has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#5ee4ff]">
              innercircle
            </h1>
            <TypewriterAnimation />
          </div>

          {!isSubmitted ? (
            /* Signup Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingLabelInput
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="Referral Code (Optional)"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              />
              <Button
                type="submit"
                className="w-full h-14 text-base font-medium bg-gradient-to-r from-[#5ee4ff] to-[#7b5cfa] hover:opacity-90 text-white rounded-xl transition-all duration-300"
              >
                Request Privileged Access
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Welcome to the inner circle! 🎉</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-1 p-3 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400">Your Referral Code</p>
                    <p className="text-lg font-mono">{personalReferralCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <SocialShareButton platform="whatsapp" referralCode={personalReferralCode} />
                  <SocialShareButton platform="twitter" referralCode={personalReferralCode} />
                  <SocialShareButton platform="instagram" referralCode={personalReferralCode} />
                </div>
              </div>
              <div className="text-center text-sm text-gray-400">
                <p>{totalSignups.toLocaleString()} people have joined innercircle</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
