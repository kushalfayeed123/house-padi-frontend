import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  imports: [CommonModule],
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.css',
})
export class ImageUploader {
// Signals for local state
  previews = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  
  // Output to notify parent (AddPropertyComponent)
  onFilesChanged = output<File[]>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private processFiles(files: File[]) {
    // Filter for images only and enforce the 15-file limit
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const combinedFiles = [...this.selectedFiles(), ...imageFiles].slice(0, 15);
    
    this.selectedFiles.set(combinedFiles);
    
    // Cleanup old object URLs to prevent memory leaks
    this.previews().forEach(url => URL.revokeObjectURL(url));
    
    // Create new previews
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    this.previews.set(newPreviews);
    
    // Emit files to parent
    this.onFilesChanged.emit(combinedFiles);
  }

  removeImage(index: number) {
    const files = this.selectedFiles();
    const urls = this.previews();
    
    // Revoke the URL of the image being removed
    URL.revokeObjectURL(urls[index]);
    
    files.splice(index, 1);
    urls.splice(index, 1);
    
    this.selectedFiles.set([...files]);
    this.previews.set([...urls]);
    this.onFilesChanged.emit([...files]);
  }
}
