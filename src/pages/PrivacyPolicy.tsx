import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, Calendar } from "lucide-react";
import { usePrivacyPolicy, type PrivacyPolicySection } from "@/hooks/usePrivacyPolicy";
import { useForm } from "react-hook-form";

export default function PrivacyPolicy() {
  const { privacyPolicySections, loading, updatePrivacyPolicySection, updateAllSectionsEffectiveDate } = usePrivacyPolicy();
  const [editingSection, setEditingSection] = useState<PrivacyPolicySection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState("");

  const { register, handleSubmit, reset, setValue } = useForm<{
    section_title: string;
    section_content: string;
  }>();

  const handleEdit = (section: PrivacyPolicySection) => {
    setEditingSection(section);
    setValue('section_title', section.section_title);
    setValue('section_content', section.section_content);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: { section_title: string; section_content: string }) => {
    if (!editingSection) return;
    
    try {
      await updatePrivacyPolicySection(editingSection.id, data);
      setIsDialogOpen(false);
      setEditingSection(null);
      reset();
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleUpdateEffectiveDate = async () => {
    if (!effectiveDate) return;
    await updateAllSectionsEffectiveDate(effectiveDate);
    setEffectiveDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Manage your website's privacy policy content</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            placeholder="Select effective date"
            className="w-auto"
          />
          <Button onClick={handleUpdateEffectiveDate} disabled={!effectiveDate}>
            <Calendar className="mr-2 h-4 w-4" />
            Update Effective Date
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {privacyPolicySections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{section.section_title}</CardTitle>
                  <CardDescription>
                    Last updated: {new Date(section.last_updated).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{section.section_content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Privacy Policy Section</DialogTitle>
            <DialogDescription>Update the content for this privacy policy section.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="section_title">Section Title</Label>
              <Input {...register('section_title', { required: true })} />
            </div>
            <div>
              <Label htmlFor="section_content">Section Content</Label>
              <Textarea {...register('section_content', { required: true })} rows={10} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}