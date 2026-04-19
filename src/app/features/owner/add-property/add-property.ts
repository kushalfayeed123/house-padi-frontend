import { CommonModule, Location } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute
import { PropertiesStore } from '../../../core/store/properties.store';
import { ImageUploader } from '../image-uploader/image-uploader';
import { Nav } from '../../../shared/components/nav/nav';
import { ToastStore } from '../../../core/store/toast.store';

@Component({
  selector: 'app-add-property',
  standalone: true, // Ensure standalone is marked if applicable
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ImageUploader, Nav],
  templateUrl: './add-property.html',
  styleUrl: './add-property.css',
})
export class AddProperty implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private propertyService = inject(PropertiesStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // For detecting edit mode
  private location = inject(Location);
  protected readonly toast = inject(ToastStore);


  // Edit Mode State
  isEditMode = signal(false);
  propertyId = signal<string | null>(null);
  existingImages = signal<string[]>([]);

  isSubmitting = signal(false);
  selectedFiles = signal<File[]>([]);
  uploadError = signal<string | null>(null);

  locations = signal<string[]>([
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Federal Capital Territory (Abuja)',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara'
  ]);
  propertyForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    price: [0, [Validators.required, Validators.min(1)]],
    leaseDurationMonths: [12, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    addressFull: ['', Validators.required],
    description: [''],
    features: this.fb.group({
      bedrooms: [0],
      bathrooms: [0],
      parking: [false],
      furnished: [false]
    })
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.propertyId.set(id);
      this.loadPropertyForEdit(id);
    }
  }

  private async loadPropertyForEdit(id: string) {
    try {
      // 1. Trigger the fetch in the store
      await this.propertyService.fetchPropertyById(id);

      // 2. Get the data from the store's signal
      const prop = this.propertyService.selectedProperty(); // Assuming this is the public signal

      if (prop) {
        this.propertyForm.patchValue({
          title: prop.title,
          price: prop.price,
          leaseDurationMonths: prop.leaseDurationMonths,
          location: prop.location,
          addressFull: prop.addressFull,
          description: prop.description,
          features: prop.features
        });
        this.existingImages.set(prop.images || []);
      }
    } catch (error) {

      console.error('Error loading property:', error);
      this.router.navigate(['/owner']);
    }
  }

  // UPDATED: In edit mode, we don't force new files if existing ones exist
  canSubmit = computed(() => {
    const isFormValid = this.propertyForm.valid;
    const hasNewFiles = this.selectedFiles().length > 0;
    const hasExistingFiles = this.existingImages().length > 0;

    if (this.isEditMode()) {
      return isFormValid; // Can update text even without new images
    }
    return isFormValid && hasNewFiles;
  });

  goBack() {
    this.location.back();
  }

  handleFiles(files: File[]) {
    this.selectedFiles.set(files);
  }

  submit() {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    const dto = {
      ...this.propertyForm.getRawValue(),
      images: this.existingImages() // Send the filtered list of URLs to the backend
    }; const files = this.selectedFiles();

    if (this.isEditMode()) {
      this.propertyService.updateProperty(this.propertyId()!, dto, files).subscribe({
        next: () => {
          this.toast.show('Property has been updated sucessfully', 'success')

          return this.router.navigate(['/owner']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Update Failed:', err.error.message);
        }
      });
    } else {
      this.propertyService.createListing(dto, files).subscribe({
        next: () => {
          this.toast.show('Property has been created sucessfully', 'success')

          return this.router.navigate(['/owner']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message;
          console.error('Upload Failed:', msg);
        }
      });
    }
  }

  removeExistingImage(imageUrl: string) {
    this.existingImages.update(images => images.filter(img => img !== imageUrl));
  }
}