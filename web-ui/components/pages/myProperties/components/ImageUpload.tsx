import React, { useState, useRef } from 'react';
import { useFieldArray, Control, useFormState, FieldValues, ArrayPath, FieldArray } from 'react-hook-form';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MediaService } from '@/services/media/media.Service';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

interface ImageUploadProps<T extends FieldValues> {
    control: Control<T>;
    name: ArrayPath<T>;
}

function ImageUpload<T extends FieldValues>({ control, name }: ImageUploadProps<T>) {
    const { fields, append, replace } = useFieldArray({
        control,
        name,
    });
    
    const { errors } = useFormState({ control });
    const errorMessage = errors[name]?.message as string;

    const [isUploading, setIsUploading] = useState(false);
    const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File) => {
        if (fields.length >= 5) return;
        try {
            setIsUploading(true);
            const response = await MediaService.uploadImage(file);
            
            append({
                imageUrl: response.secure_url,
                isPrimary: fields.length === 0,
                sortOrder: fields.length,
            } as unknown as FieldArray<T, ArrayPath<T>>);
        } catch (error) {
            if (error instanceof ApiError && !error.isToast) {
                toast.error(error.message|| "Failed to upload the image")
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFile(files[0]);
    };

    const handleDropZoneOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOverDropZone(true);
    };

    const handleDropZoneLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOverDropZone(false);
    };

    const handleDropZoneDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOverDropZone(false);
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        await uploadFile(files[0]);
    };

    // Item Drag & Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOverItem = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        
        const newFields = [...fields];
        const [draggedItem] = newFields.splice(draggedIndex, 1);
        newFields.splice(dropIndex, 0, draggedItem);
        
        const updatedFields = newFields.map((field, i) => ({
            ...field,
            isPrimary: i === 0,
            sortOrder: i
        }));
        
        replace(updatedFields as unknown as FieldArray<T, ArrayPath<T>>[]);
        setDraggedIndex(null);
    };

    const handleRemove = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const newFields = [...fields];
        newFields.splice(index, 1);
        
        const updatedFields = newFields.map((field, i) => ({
            ...field,
            isPrimary: i === 0,
            sortOrder: i
        }));
        
        replace(updatedFields as unknown as FieldArray<T, ArrayPath<T>>[]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    Property Images
                </label>
                <span className="text-xs text-gray-500">{fields.length}/5 images</span>
            </div>

            {/* Upload Area */}
            {fields.length < 5 && (
                <div 
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer
                        ${isDragOverDropZone ? 'border-blue-400 bg-blue-50' : errorMessage ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    `}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragOver={handleDropZoneOver}
                    onDragLeave={handleDropZoneLeave}
                    onDrop={handleDropZoneDrop}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm font-medium text-gray-600">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className={`w-8 h-8 mb-2 ${isDragOverDropZone ? 'text-blue-400' : errorMessage ? 'text-red-400' : 'text-gray-400'}`} />
                            <p className={`text-sm font-medium ${isDragOverDropZone ? 'text-blue-600' : errorMessage ? 'text-red-600' : 'text-gray-600'}`}>
                                {isDragOverDropZone ? 'Drop image here' : 'Click or drag image to upload'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </>
                    )}
                </div>
            )}
            
            {errorMessage && (
                <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}

            {/* Image Preview List */}
            {fields.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fields.map((field: any, index: number) => (
                        <div 
                            key={field.id} 
                            className={`relative group rounded-lg overflow-hidden border-2 aspect-video bg-gray-100 cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95 border-blue-400' : 'border-transparent hover:border-gray-300'}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOverItem(e, index)}
                            onDrop={(e) => handleDropItem(e, index)}
                        >
                            <img 
                                src={field.imageUrl} 
                                alt={`Property ${index + 1}`} 
                                className="w-full h-full object-cover pointer-events-none"
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(index, e)}
                                        className="p-1.5 rounded-md bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-sm transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {index === 0 && (
                                    <span className="text-xs font-medium text-white bg-black/50 self-start px-2 py-0.5 rounded backdrop-blur-sm">
                                        Primary
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
