
import { Button } from "@/components/ui/button";
import { MessageSquare as WhatsappIcon, Twitter, Share, Phone } from 'lucide-react';

interface SocialShareButtonProps {
  platform: 'whatsapp' | 'x' | 'copy';
  referralCode: string;
  useAltIcon?: boolean;
}

export const SocialShareButton = ({ platform, referralCode, useAltIcon = false }: SocialShareButtonProps) => {
  const message = `i just secured my spot in innercircle! want in? sign up now and get ahead of the line: innercircle.events?ref=${referralCode}\n\n_innercircle: the ultimate insider platform for event lovers._`;
  
  const getShareUrl = () => {
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      case 'copy':
        return null;
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'whatsapp':
        return useAltIcon ? <Phone className="w-4 h-4 mr-2" /> : <WhatsappIcon className="w-4 h-4 mr-2" />;
      case 'x':
        return <Twitter className="w-4 h-4 mr-2" />;
      case 'copy':
        return <Share className="w-4 h-4 mr-2" />;
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
      {platform === 'x' ? 'share on x (twitter)' : platform === 'copy' ? 'share (copy text)' : `share on ${platform}`}
    </Button>
  );
};
