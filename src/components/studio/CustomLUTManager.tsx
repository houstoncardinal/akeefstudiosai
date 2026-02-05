import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, Trash2, Edit2, Heart, Search, Grid, List, 
  FolderPlus, Download, MoreVertical, Check, X, Loader2,
  FileImage, Star, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface CustomLUT {
  id: string;
  name: string;
  description: string | null;
  category: string;
  file_path: string;
  thumbnail_path: string | null;
  intensity: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  publicUrl?: string;
}

interface CustomLUTManagerProps {
  onSelectLUT?: (lut: CustomLUT) => void;
  selectedLutId?: string;
}

const CATEGORIES = [
  { value: 'custom', label: 'Custom' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'modern', label: 'Modern' },
  { value: 'creative', label: 'Creative' },
  { value: 'correction', label: 'Correction' },
];

export default function CustomLUTManager({ onSelectLUT, selectedLutId }: CustomLUTManagerProps) {
  const isMobile = useIsMobile();
  const [luts, setLuts] = useState<CustomLUT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Edit dialog state
  const [editingLut, setEditingLut] = useState<CustomLUT | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('custom');
  const [editIntensity, setEditIntensity] = useState(100);
  
  // Delete confirmation
  const [deletingLut, setDeletingLut] = useState<CustomLUT | null>(null);

  // Upload dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('custom');
  const [uploadDescription, setUploadDescription] = useState('');

  const fetchLuts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLuts([]);
        return;
      }

      const { data, error } = await supabase
        .from('custom_luts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get public URLs for each LUT
      const lutsWithUrls = (data || []).map(lut => {
        const { data: urlData } = supabase.storage
          .from('custom-luts')
          .getPublicUrl(lut.file_path);
        return { ...lut, publicUrl: urlData.publicUrl };
      });

      setLuts(lutsWithUrls);
    } catch (error) {
      console.error('Error fetching LUTs:', error);
      toast.error('Failed to load custom LUTs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch LUTs on mount
  useEffect(() => {
    fetchLuts();
  }, [fetchLuts]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadFile(file);
      setUploadName(file.name.replace(/\.(cube|3dl|look|lut)$/i, ''));
      setShowUploadDialog(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.cube', '.3dl', '.look', '.lut'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload LUTs');
        return;
      }

      const fileExt = uploadFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${uploadName}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('custom-luts')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Create metadata record
      const { error: dbError } = await supabase
        .from('custom_luts')
        .insert({
          user_id: user.id,
          name: uploadName.trim(),
          description: uploadDescription.trim() || null,
          category: uploadCategory,
          file_path: filePath,
          intensity: 100,
        });

      if (dbError) throw dbError;

      toast.success('LUT uploaded successfully!');
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadName('');
      setUploadDescription('');
      setUploadCategory('custom');
      fetchLuts();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload LUT');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (lut: CustomLUT) => {
    setEditingLut(lut);
    setEditName(lut.name);
    setEditDescription(lut.description || '');
    setEditCategory(lut.category);
    setEditIntensity(lut.intensity);
  };

  const handleSaveEdit = async () => {
    if (!editingLut) return;

    try {
      const { error } = await supabase
        .from('custom_luts')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          category: editCategory,
          intensity: editIntensity,
        })
        .eq('id', editingLut.id);

      if (error) throw error;

      toast.success('LUT updated successfully!');
      setEditingLut(null);
      fetchLuts();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update LUT');
    }
  };

  const handleDelete = async () => {
    if (!deletingLut) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('custom-luts')
        .remove([deletingLut.file_path]);

      if (storageError) console.error('Storage delete error:', storageError);

      // Delete metadata
      const { error: dbError } = await supabase
        .from('custom_luts')
        .delete()
        .eq('id', deletingLut.id);

      if (dbError) throw dbError;

      toast.success('LUT deleted successfully!');
      setDeletingLut(null);
      fetchLuts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete LUT');
    }
  };

  const toggleFavorite = async (lut: CustomLUT) => {
    try {
      const { error } = await supabase
        .from('custom_luts')
        .update({ is_favorite: !lut.is_favorite })
        .eq('id', lut.id);

      if (error) throw error;

      setLuts(prev => prev.map(l => 
        l.id === lut.id ? { ...l, is_favorite: !l.is_favorite } : l
      ));
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  // Filter LUTs
  const filteredLuts = luts.filter(lut => {
    const matchesSearch = lut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lut.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || lut.category === filterCategory;
    const matchesFavorites = !showFavoritesOnly || lut.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const EditContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input 
          value={editName} 
          onChange={(e) => setEditName(e.target.value)} 
          placeholder="LUT name"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input 
          value={editDescription} 
          onChange={(e) => setEditDescription(e.target.value)} 
          placeholder="Optional description"
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={editCategory} onValueChange={setEditCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Default Intensity: {editIntensity}%</Label>
        <Slider
          value={[editIntensity]}
          onValueChange={([v]) => setEditIntensity(v)}
          min={0}
          max={100}
          step={1}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => setEditingLut(null)}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSaveEdit}>
          <Check className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">My LUT Library</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", viewMode === 'list' && 'bg-muted')}
              onClick={() => setViewMode('list')}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search LUTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", showFavoritesOnly && 'text-warning bg-warning/10')}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className={cn("w-3.5 h-3.5", showFavoritesOnly && 'fill-current')} />
          </Button>
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={cn(
          "m-3 p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive ? "border-primary bg-primary/10" : "border-border/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-lg bg-primary/10">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop LUT file here" : "Import Custom LUT"}
            </p>
            <p className="text-xs text-muted-foreground">
              .cube, .3dl, .look, or image files
            </p>
          </div>
        </div>
      </div>

      {/* LUT grid/list */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLuts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No custom LUTs yet</p>
              <p className="text-xs">Upload your first LUT above</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredLuts.map(lut => (
                <div
                  key={lut.id}
                  onClick={() => onSelectLUT?.(lut)}
                  className={cn(
                    "relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                    selectedLutId === lut.id 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-transparent hover:border-primary/30"
                  )}
                >
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    {lut.thumbnail_path ? (
                      <img src={lut.publicUrl} alt={lut.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileImage className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs font-medium text-white truncate">{lut.name}</p>
                    <Badge variant="outline" className="text-[9px] mt-1 bg-black/50 text-white/80 border-white/20">
                      {lut.category}
                    </Badge>
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(lut); }}
                    >
                      <Heart className={cn("w-3 h-3", lut.is_favorite && "fill-warning text-warning")} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(lut)}>
                          <Edit2 className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-3.5 h-3.5 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeletingLut(lut)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLuts.map(lut => (
                <div
                  key={lut.id}
                  onClick={() => onSelectLUT?.(lut)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                    selectedLutId === lut.id 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-12 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <FileImage className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lut.name}</p>
                    <p className="text-xs text-muted-foreground">{lut.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(lut); }}
                    >
                      <Heart className={cn("w-3.5 h-3.5", lut.is_favorite && "fill-warning text-warning")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); handleEdit(lut); }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeletingLut(lut); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import LUT</DialogTitle>
            <DialogDescription>
              Add details for your custom LUT file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileImage className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadFile && (uploadFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={uploadName} 
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="LUT name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input 
                value={uploadDescription} 
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadName.trim()}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import LUT
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog/Sheet/Drawer */}
      {isMobile ? (
        <Drawer open={!!editingLut} onOpenChange={(open) => !open && setEditingLut(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit LUT</DrawerTitle>
              <DrawerDescription>Update LUT details</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <EditContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={!!editingLut} onOpenChange={(open) => !open && setEditingLut(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit LUT</SheetTitle>
              <SheetDescription>Update LUT details</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <EditContent />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deletingLut} onOpenChange={(open) => !open && setDeletingLut(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete LUT</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingLut?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLut(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}