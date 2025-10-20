import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, FolderOpen, Image, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { ImageUpload } from "@/components/ui/image-upload";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | File | null;
  secondary_image?: string | File | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  sub_services_count: number;
  color: string
}


export default function Categories() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsAddDialogOpen(true);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    if (selectedCategory) {
      // Edit existing category
      const result = await updateCategory(selectedCategory.id, categoryData);
      if (result.success) {
        toast({
          title: "Category Updated",
          description: "Category has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update category",
          variant: "destructive",
        });
      }
    } else {
      // Add new category
      const result = await createCategory(categoryData);
      if (result.success) {
        toast({
          title: "Category Added",
          description: "New category has been added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create category",
          variant: "destructive",
        });
      }
    }
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await deleteCategory(categoryId);
    if (result.success) {
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const activeCategories = categories.filter(cat => cat.status === 'Active').length;
  const totalSubServices = categories.reduce((acc, cat) => acc + cat.sub_services_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
          <p className="text-muted-foreground">Manage service categories and their organization</p>
        </div>
        <Button
          className="bg-gradient-primary text-white hover:opacity-90"
          onClick={handleAddCategory}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                <p className="text-2xl font-bold text-success">{activeCategories}</p>
              </div>
              <Tag className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sub-Services</p>
                <p className="text-2xl font-bold text-foreground">{totalSubServices}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Categories Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sub-Services</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={'https://back-end-for-xirfadsan.onrender.com/api/services/secondry_image/'+category.id}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm">
                        {category.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.sub_services_count} services</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-success">${category.total_revenue.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.status === 'Active' ? 'default' : 'destructive'}>
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(category.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              onSave={handleSaveCategory}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSave={handleSaveCategory}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Omit<Category, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: category?.id || "",
    name: category?.name || "",
    description: category?.description || "",
    image: category?.image || null,
    secondary_image: category?.secondary_image || null,
    sub_services_count: category?.sub_services_count || 0,
    status: category?.status || 'Active' as 'Active' | 'Inactive',
    color: category?.color || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Color</Label>
          <Input
            id="name"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="Enter color"
            type="color"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image">Primary Image</Label>
          <ImageUpload
            value={formData.id === "" ? formData.image : `https://back-end-for-xirfadsan.onrender.com/api/services/image/${formData.id}`}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="category-images"
            placeholder="Upload category image"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondary_image">Secondary Image</Label>
          <ImageUpload
            value={formData.id === "" ? formData.secondary_image : `https://back-end-for-xirfadsan.onrender.com/api/services/secondry_image/${formData.id}`}
            onChange={(url) => setFormData({ ...formData, secondary_image: url })}
            bucket="category-images"
            placeholder="Upload secondary image"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          {category ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
}




// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Search, Plus, Edit, Trash2, FolderOpen, Image, Tag } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useCategories } from "@/hooks/useCategories";
// import { ImageUpload } from "@/components/ui/image-upload";

// interface Category {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
//   secondary_image?: string;
//   status: 'active' | 'inactive';
//   created_at: string;
//   sub_services_count: number;
// }


// export default function Categories() {
//   const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const { toast } = useToast();

//   const filteredCategories = categories.filter(category =>
//     category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     category.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleEditCategory = (category: Category) => {
//     setSelectedCategory(category);
//     setIsEditDialogOpen(true);
//   };

//   const handleAddCategory = () => {
//     setSelectedCategory(null);
//     setIsAddDialogOpen(true);
//   };

//   const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
//     if (selectedCategory) {
//       // Edit existing category
//       const result = await updateCategory(selectedCategory.id, categoryData);
//       if (result.success) {
//         toast({
//           title: "Category Updated",
//           description: "Category has been updated successfully.",
//         });
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to update category",
//           variant: "destructive",
//         });
//       }
//     } else {
//       // Add new category
//       const result = await createCategory(categoryData);
//       if (result.success) {
//         toast({
//           title: "Category Added",
//           description: "New category has been added successfully.",
//         });
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to create category",
//           variant: "destructive",
//         });
//       }
//     }
//     setIsEditDialogOpen(false);
//     setIsAddDialogOpen(false);
//     setSelectedCategory(null);
//   };

//   const handleDeleteCategory = async (categoryId: string) => {
//     const result = await deleteCategory(categoryId);
//     if (result.success) {
//       toast({
//         title: "Category Deleted",
//         description: "Category has been deleted successfully.",
//         variant: "destructive",
//       });
//     } else {
//       toast({
//         title: "Error",
//         description: result.error || "Failed to delete category",
//         variant: "destructive",
//       });
//     }
//   };

//   const activeCategories = categories.filter(cat => cat.status === 'active').length;
//   const totalSubServices = categories.reduce((acc, cat) => acc + cat.sub_services_count, 0);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
//           <p className="text-muted-foreground">Manage service categories and their organization</p>
//         </div>
//         <Button 
//           className="bg-gradient-primary text-white hover:opacity-90"
//           onClick={handleAddCategory}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add Category
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="bg-gradient-card shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
//                 <p className="text-2xl font-bold text-foreground">{categories.length}</p>
//               </div>
//               <FolderOpen className="h-8 w-8 text-primary" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-gradient-card shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
//                 <p className="text-2xl font-bold text-success">{activeCategories}</p>
//               </div>
//               <Tag className="h-8 w-8 text-success" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-gradient-card shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Sub-Services</p>
//                 <p className="text-2xl font-bold text-foreground">{totalSubServices}</p>
//               </div>
//               <FolderOpen className="h-8 w-8 text-primary" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="bg-gradient-card shadow-card">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FolderOpen className="h-5 w-5 text-primary" />
//             Categories Overview
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col sm:flex-row gap-4 mb-6">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                 <Input
//                   placeholder="Search categories..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Sub-Services</TableHead>
//                   <TableHead>Revenue</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredCategories.map((category) => (
//                   <TableRow key={category.id}>
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
//                           <img
//                             src={category.image}
//                             alt={category.name}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.currentTarget.src = "/placeholder.svg";
//                             }}
//                           />
//                         </div>
//                         <div>
//                           <div className="font-medium">{category.name}</div>
//                           <div className="text-sm text-muted-foreground">ID: {category.id}</div>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="max-w-[200px] truncate text-sm">
//                         {category.description}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline">{category.sub_services_count} services</Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-1">
//                         <span className="text-sm font-medium text-success">${category.total_revenue.toFixed(2)}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={category.status === 'active' ? 'default' : 'destructive'}>
//                         {category.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="text-sm">
//                         {new Date(category.created_at).toLocaleDateString()}
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleEditCategory(category)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleDeleteCategory(category.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Edit Category Dialog */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Edit Category</DialogTitle>
//           </DialogHeader>
//           {selectedCategory && (
//             <CategoryForm
//               category={selectedCategory}
//               onSave={handleSaveCategory}
//               onCancel={() => setIsEditDialogOpen(false)}
//             />
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Add Category Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Add New Category</DialogTitle>
//           </DialogHeader>
//           <CategoryForm
//             onSave={handleSaveCategory}
//             onCancel={() => setIsAddDialogOpen(false)}
//           />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// interface CategoryFormProps {
//   category?: Category;
//   onSave: (category: Omit<Category, 'id' | 'created_at'>) => void;
//   onCancel: () => void;
// }

// function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
//   const [formData, setFormData] = useState({
//     name: category?.name || "",
//     description: category?.description || "",
//     image: category?.image || "/placeholder.svg",
//     secondary_image: category?.secondary_image || "",
//     sub_services_count: category?.sub_services_count || 0,
//     status: category?.status || 'active' as 'active' | 'inactive'
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="name">Category Name</Label>
//         <Input
//           id="name"
//           value={formData.name}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           placeholder="Enter category name"
//           required
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="description">Description</Label>
//         <Textarea
//           id="description"
//           value={formData.description}
//           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           placeholder="Enter category description"
//           required
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="image">Primary Image</Label>
//         <ImageUpload
//           value={formData.image}
//           onChange={(url) => setFormData({ ...formData, image: url })}
//           bucket="category-images"
//           placeholder="Upload category image"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="secondary_image">Secondary Image</Label>
//         <ImageUpload
//           value={formData.secondary_image || ''}
//           onChange={(url) => setFormData({ ...formData, secondary_image: url })}
//           bucket="category-images"
//           placeholder="Upload secondary image"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="status">Status</Label>
//         <select
//           id="status"
//           value={formData.status}
//           onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
//           className="w-full p-2 border rounded-md bg-background"
//         >
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>
//       <div className="flex justify-end gap-2">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button type="submit" className="bg-gradient-primary text-white">
//           {category ? 'Update' : 'Create'} Category
//         </Button>
//       </div>
//     </form>
//   );
// }

