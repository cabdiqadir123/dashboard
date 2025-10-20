-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  cover_image TEXT,
  content TEXT,
  slug TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  person_image TEXT,
  person_name TEXT NOT NULL,
  person_role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image TEXT,
  linkedin_profile TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy_policy table
CREATE TABLE public.privacy_policy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_title TEXT NOT NULL,
  section_content TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account_deletion_requests table
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT NOT NULL,
  reason TEXT,
  confirmation_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_posts
CREATE POLICY "Admins can manage blog_posts" ON public.blog_posts FOR ALL USING (is_admin());
CREATE POLICY "Public can view published blog_posts" ON public.blog_posts FOR SELECT USING (is_published = true);

-- RLS policies for testimonials
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (is_admin());
CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);

-- RLS policies for team_members
CREATE POLICY "Admins can manage team_members" ON public.team_members FOR ALL USING (is_admin());
CREATE POLICY "Public can view active team_members" ON public.team_members FOR SELECT USING (is_active = true);

-- RLS policies for contact_messages
CREATE POLICY "Admins can manage contact_messages" ON public.contact_messages FOR ALL USING (is_admin());
CREATE POLICY "Users can create contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- RLS policies for privacy_policy
CREATE POLICY "Admins can manage privacy_policy" ON public.privacy_policy FOR ALL USING (is_admin());
CREATE POLICY "Public can view privacy_policy" ON public.privacy_policy FOR SELECT USING (true);

-- RLS policies for account_deletion_requests
CREATE POLICY "Admins can manage account_deletion_requests" ON public.account_deletion_requests FOR ALL USING (is_admin());
CREATE POLICY "Users can create account_deletion_requests" ON public.account_deletion_requests FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_privacy_policy_updated_at
  BEFORE UPDATE ON public.privacy_policy
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Insert default privacy policy sections
INSERT INTO public.privacy_policy (section_title, section_content, section_order) VALUES
('What We Collect', 'Information about what data we collect from users.', 1),
('How We Use It', 'Details on how we use the collected information.', 2),
('Your Control', 'Information about user control over their data.', 3),
('Data Security', 'Our security measures to protect your data.', 4),
('Information Sharing', 'How and when we share information with third parties.', 5),
('Your Rights and Choices', 'User rights regarding their personal data.', 6),
('Data Retention', 'How long we keep your information.', 7),
('International Users', 'Information for users outside our primary jurisdiction.', 8),
('Changes to This Policy', 'How we handle updates to this privacy policy.', 9);