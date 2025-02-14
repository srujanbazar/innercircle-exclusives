
import { Button } from "@/components/ui/button";
import { MessageSquare, Twitter, Instagram } from 'lucide-react';

interface SocialShareButtonProps {
  platform: 'whatsapp' | 'x' | 'instagram';
  referralCode: string;
}

export const SocialShareButton = ({ platform, referralCode }: SocialShareButtonProps) => {
  const message = `i just secured my spot in innercircle! want in? sign up now and get ahead of the line: innercircle.events?ref=${referralCode}\n\n_innercircle: the ultimate insider platform for event lovers._`;
  
  const getShareUrl = () => {
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      case 'instagram':
        return null;
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 mr-2" />;
      case 'x':
        return <Twitter className="w-4 h-4 mr-2" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 mr-2" />;
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
      className="w-full bg-gray-800 hover:bg-gray-700 border-gray-700 font-satoshi"
    >
      {getIcon()}
      share on {platform === 'x' ? 'x (twitter)' : platform}
    </Button>
  );
};
