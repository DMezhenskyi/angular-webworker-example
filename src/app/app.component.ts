import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('imagePreview', { static: true })
  protected imagePreview!: ElementRef<HTMLCanvasElement>;

  private imagePreviewCtx!: CanvasRenderingContext2D | null;

  private worker!: Worker;

  ngOnInit() {
    this.imagePreviewCtx = this.imagePreview.nativeElement.getContext('2d');
    this.worker = new Worker(new URL('./image-filter.worker', import.meta.url));
    this.worker.onmessage = ({ data: processedImage }) => {
      this.imagePreviewCtx?.putImageData(processedImage, 0, 0);
    };
  }

  ngOnDestroy() {
    this.worker.terminate();
  }

  loadImage(e: Event) {
    const image = (e.target as HTMLInputElement).files![0];
    createImageBitmap(image).then((bitmap) => {
      this.imagePreview.nativeElement.width = bitmap.width;
      this.imagePreview.nativeElement.height = bitmap.height;
      this.imagePreviewCtx?.drawImage(bitmap, 0, 0);
    });
  }

  applyFilter() {
    const { width, height } = this.imagePreview.nativeElement;
    const imageData = this.imagePreviewCtx?.getImageData(0, 0, width, height);
    if (imageData) {
      this.worker.postMessage(imageData, [imageData.data.buffer]);
    }
  }
}
