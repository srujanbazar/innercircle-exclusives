
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
  const shareMessage = `i just secured my spot in innercircle! want in? sign up now and get ahead of the line: innercircle.events?ref=${personalReferralCode}\n\n_innercircle: the ultimate insider platform for event lovers._`;

  // New count fetch implementation
  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setTotalSignups(count);
      }
    };

    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Step 1: Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (emailCheckError) {
        console.error('Email check error:', emailCheckError);
        toast({
          description: "something went wrong. please try again!",
          variant: "destructive",
        });
        return;
      }

      if (existingUser) {
        toast({
          description: "this email is already registered. please use a different email!",
          variant: "destructive",
        });
        return;
      }

      // Step 2: If referral code is provided, validate it
      let referrerFullName = null;
      if (formData.referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('waitlist')
          .select('full_name')
          .eq('referral_code', formData.referralCode.trim())
          .maybeSingle();

        if (referrerError) {
          console.error('Referral validation error:', referrerError);
          toast({
            description: "something went wrong checking the referral code. please try again!",
            variant: "destructive",
          });
          return;
        }

        if (!referrerData) {
          toast({
            description: "invalid referral code. please check and try again!",
            variant: "destructive",
          });
          return;
        }

        referrerFullName = referrerData.full_name;
      }

      // Step 3: Generate new referral code
      const { data: newReferralCode, error: genError } = await supabase.rpc('generate_referral_code');
      if (genError) {
        console.error('Generate referral code error:', genError);
        toast({
          description: "something went wrong generating your referral code. please try again!",
          variant: "destructive",
        });
        return;
      }

      // Step 4: Insert new user
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({
          full_name: formData.fullName.toLowerCase(),
          email: formData.email.toLowerCase(),
          city: formData.city.toLowerCase(),
          referral_code: newReferralCode,
          referred_by: formData.referralCode ? formData.referralCode.trim() : null
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        toast({
          description: "something went wrong saving your information. please try again!",
          variant: "destructive",
        });
        return;
      }

      // Step 5: Update UI state
      setPersonalReferralCode(newReferralCode);
      if (referrerFullName) setReferrerName(referrerFullName);
      setIsSubmitted(true);

      // Step 6: Refresh total count
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      if (count !== null) {
        setTotalSignups(count);
      }

    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        description: "something unexpected went wrong. please try again!",
        variant: "destructive",
      });
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(shareMessage);
    toast({
      description: "share message copied to clipboard!",
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
    <div className="min-h-screen h-screen bg-black text-white font-satoshi flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-md h-full flex items-center">
        <div className="w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#5ee4ff]">
              innercircle
            </h1>
            <TypewriterAnimation />
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                className="w-full h-12 sm:h-14 text-base font-medium bg-gradient-to-r from-[#5ee4ff] to-[#7b5cfa] hover:opacity-90 text-white rounded-xl transition-all duration-300"
              >
                get early access to innercircle
              </Button>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="p-4 sm:p-8 bg-[#13151a] rounded-2xl border border-gray-800 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 font-satoshi">
                  {referrerName ? (
                    <>you're in! {referrerName} is glad to have you in innercircle. stay tuned—big things are coming.</>
                  ) : (
                    <>done! you're now on the list. the more friends you invite, the sooner you'll enter innercircle.</>
                  )}
                </h3>
                <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                  <div className="flex-1 p-3 sm:p-4 bg-[#13151a] rounded-xl border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 font-satoshi">your referral code</p>
                    <p className="text-base sm:text-lg font-mono font-satoshi">{personalReferralCode}</p>
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
                <div className="space-y-2 sm:space-y-3">
                  <SocialShareButton platform="whatsapp" referralCode={personalReferralCode} />
                  <SocialShareButton platform="x" referralCode={personalReferralCode} />
                  <SocialShareButton platform="copy" referralCode={personalReferralCode} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs sm:text-sm text-gray-400 font-satoshi">
                  innercircle is growing—{totalSignups.toLocaleString()} event lovers are already on the list!
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
