import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, ExternalLink } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  short_description: string;
  cover_image?: string;
  content?: string;
  is_published: boolean;
  created_at: string;
}

interface Testimonial {
  id: string;
  title: string;
  description: string;
  person_image?: string;
  person_name: string;
  person_role: string;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  linkedin_profile?: string;
  is_active: boolean;
}

interface LivePreviewProps {
  type: 'blog' | 'testimonial' | 'team';
  data: BlogPost | Testimonial | TeamMember;
  trigger?: React.ReactNode;
}

export function LivePreview({ type, data, trigger }: LivePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderBlogPreview = (post: BlogPost) => (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Blog Header */}
      <div className="space-y-4">
        {post.cover_image && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={post.is_published ? "default" : "secondary"}>
              {post.is_published ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-xl text-muted-foreground">{post.short_description}</p>
        </div>
      </div>

      {/* Blog Content */}
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap">{post.content || "No content available for preview."}</div>
      </div>
    </div>
  );

  const renderTestimonialPreview = (testimonial: Testimonial) => (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{testimonial.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <blockquote className="text-lg italic leading-relaxed">
            "{testimonial.description}"
          </blockquote>
          
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-16 w-16">
              {testimonial.person_image ? (
                <AvatarImage src={testimonial.person_image} alt={testimonial.person_name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {testimonial.person_name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold">{testimonial.person_name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.person_role}</p>
            </div>
          </div>

          <Badge variant={testimonial.is_active ? "default" : "secondary"}>
            {testimonial.is_active ? "Active" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeamMemberPreview = (member: TeamMember) => (
    <div className="max-w-sm mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              {member.image ? (
                <AvatarImage src={member.image} alt={member.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {member.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-muted-foreground">{member.role}</p>
          </div>

          {member.linkedin_profile && (
            <Button variant="outline" size="sm" asChild>
              <a href={member.linkedin_profile} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                LinkedIn Profile
              </a>
            </Button>
          )}

          <Badge variant={member.is_active ? "default" : "secondary"}>
            {member.is_active ? "Active" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreview = () => {
    switch (type) {
      case 'blog':
        return renderBlogPreview(data as BlogPost);
      case 'testimonial':
        return renderTestimonialPreview(data as Testimonial);
      case 'team':
        return renderTeamMemberPreview(data as TeamMember);
      default:
        return <div>Preview not available</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live Preview</DialogTitle>
          <DialogDescription>
            This is how your content will appear on the website
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 border rounded-lg bg-background/50">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}