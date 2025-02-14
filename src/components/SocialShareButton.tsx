
import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SocialShareButtonProps {
  platform: 'whatsapp' | 'twitter' | 'instagram';
  referralCode: string;
}

export const SocialShareButton = ({ platform, referralCode }: SocialShareButtonProps) => {
  const { toast } = useToast();
  const message = `i just secured my spot in innercircle! want in? sign up now and get ahead of the line: innercircle.com?ref=${referralCode}\n\n_innercircle: the ultimate insider platform for event lovers._`;
  
  const getShareUrl = () => {
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      case 'instagram':
        return null;
    }
  };

  const handleShare = () => {
    const url = getShareUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      toast({
        description: "message copied! paste it on instagram to share.",
      });
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast({
      description: "message copied to clipboard!",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700 font-satoshi"
      >
        <Share2 className="w-4 h-4 mr-2" />
        share on {platform}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyMessage}
        className="bg-gray-800 hover:bg-gray-700 border-gray-700"
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
};
