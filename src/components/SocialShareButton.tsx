
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface SocialShareButtonProps {
  platform: 'whatsapp' | 'twitter' | 'instagram';
  referralCode: string;
}

export const SocialShareButton = ({ platform, referralCode }: SocialShareButtonProps) => {
  const message = encodeURIComponent(`🚀 I just got early access to innercircle! Sign up now and skip the waitlist: innercircle.com?ref=${referralCode}`);
  
  const getShareUrl = () => {
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${message}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${message}`;
      case 'instagram':
        // Instagram doesn't support direct sharing, so we'll copy to clipboard
        return null;
    }
  };

  const handleShare = () => {
    const url = getShareUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="bg-gray-800 hover:bg-gray-700 border-gray-700"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </Button>
  );
};
