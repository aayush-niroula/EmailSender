<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class FileOptimizer
{
    public function __construct(
        private ImageOptimizer $imageOptimizer,
        private PdfOptimizer $pdfOptimizer,
        private DocxOptimizer $docxOptimizer
    ) {}

    public function optimize(UploadedFile $file): array
    {
        $originalSize = $file->getSize();

        $oneMb = 1024 * 1024;

        if ($originalSize <= $oneMb) {
            return [
                'file' => $file,
                'optimized' => false,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
            ];
        }

        $mimeType = $file->getMimeType();

        if (in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
            return $this->imageOptimizer->optimize($file);
        }

        if ($mimeType === 'application/pdf') {
            return $this->pdfOptimizer->optimize($file);
        }

        if (
            $mimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            return $this->docxOptimizer->optimize($file);
        }

        return [
            'file' => $file,
            'optimized' => false,
            'original_size' => $originalSize,
            'optimized_size' => $originalSize,
        ];
    }
}
