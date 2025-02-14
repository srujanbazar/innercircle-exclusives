import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { TypewriterAnimation } from '@/components/TypewriterAnimation';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { SocialShareButton } from '@/components/SocialShareButton';
import { Button } from '@/components/ui/button';
import { Copy, Home } from 'lucide-react';
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
  const [referrerName, setReferrerName] = useState('');

  // Subscribe to realtime updates
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
      // Validate referral code if provided
      if (formData.referralCode) {
        const { data: referrer, error: referrerError } = await supabase
          .from('waitlist')
          .select('full_name')
          .eq('referral_code', formData.referralCode)
          .maybeSingle();
          
        if (referrerError) {
          toast({
            description: "oops! something went wrong while checking the referral code. please try again!",
            variant: "destructive",
          });
          return;
        }

        if (!referrer) {
          toast({
            description: "hmm... that referral code doesn't seem right. double-check and try again!",
            variant: "destructive",
          });
          return;
        }
        setReferrerName(referrer.full_name);
      }

      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) throw error;

      const referralCode = data;
      
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          {
            full_name: formData.fullName.toLowerCase(),
            email: formData.email.toLowerCase(),
            city: formData.city.toLowerCase(),
            referral_code: referralCode,
            referred_by: formData.referralCode || null
          }
        ]);

      if (insertError) {
        toast({
          description: "something went wrong while signing you up. please try again!",
          variant: "destructive",
        });
        return;
      }

      setPersonalReferralCode(referralCode);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        description: "oops! something unexpected happened. please try again!",
        variant: "destructive",
      });
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(personalReferralCode);
    toast({
      description: "referral code copied to clipboard!",
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      city: '',
      referralCode: ''
    });
    setReferrerName('');
  };

  return (
    <div className="min-h-screen bg-black text-white font-satoshi flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
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
                label="full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <FloatingLabelInput
                label="referral code (optional)"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              />
              <Button
                type="submit"
                className="w-full h-14 text-base font-medium bg-gradient-to-r from-[#5ee4ff] to-[#7b5cfa] hover:opacity-90 text-white rounded-xl transition-all duration-300"
              >
                get early access to innercircle
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6 animate-fade-in">
              <div className="p-8 bg-gradient-to-br from-[#13151a] to-[#1a1f2c] rounded-2xl border border-gray-800 shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-[#5ee4ff]">
                  {referrerName ? (
                    <>you're in! {referrerName} is glad to have you in innercircle. stay tuned—big things are coming.</>
                  ) : (
                    <>done! you're now on the list. the more friends you invite, the sooner you'll enter innercircle.</>
                  )}
                </h3>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex-1 p-4 bg-[#13151a] rounded-xl border border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">your referral code</p>
                    <p className="text-lg font-mono text-[#5ee4ff]">{personalReferralCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    className="bg-[#13151a] hover:bg-gray-800 border-gray-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <SocialShareButton platform="whatsapp" referralCode={personalReferralCode} />
                  <SocialShareButton platform="twitter" referralCode={personalReferralCode} />
                  <SocialShareButton platform="instagram" referralCode={personalReferralCode} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {totalSignups.toLocaleString()} people have joined innercircle
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="hover:bg-gray-800"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
