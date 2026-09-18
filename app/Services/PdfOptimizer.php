<?php

namespace App\Services;

use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PdfOptimizer
{
    public function optimize(UploadedFile $file): array
    {
        $originalSize = $file->getSize();

        if (! function_exists('exec')) {
            return [
                'file' => $file,
                'optimized' => false,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
            ];
        }

        // Temporary input and output files
        $inputPath = $file->getRealPath();

        $filename = uniqid('optimized_').'.pdf';

        $outputDirectory = storage_path('app/temp');

        if (! is_dir($outputDirectory)) {
            mkdir($outputDirectory, 0755, true);
        }

        $outputPath = $outputDirectory.DIRECTORY_SEPARATOR.$filename;

        $command = sprintf(
            'gswin64c -sDEVICE=pdfwrite '.
            '-dCompatibilityLevel=1.4 '.
            '-dPDFSETTINGS=/ebook '.
            '-dNOPAUSE '.
            '-dQUIET '.
            '-dBATCH '.
            '-sOutputFile=%s %s 2>&1',
            escapeshellarg($outputPath),
            escapeshellarg($inputPath)
        );

        exec($command, $output, $returnCode);

        if (
            $returnCode !== 0 ||
            ! file_exists($outputPath)
        ) {
            return [
                'file' => $file,
                'optimized' => false,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
            ];
        }

        $optimizedSize = filesize($outputPath);

        if ($optimizedSize < $originalSize) {

            $storedPath = Storage::disk('public')->putFileAs(
                'attachments',
                new File($outputPath),
                $filename
            );

            unlink($outputPath);

            return [
                'filepath' => $storedPath,
                'file_name' => $filename,
                'mime_type' => 'application/pdf',
                'file_size' => $optimizedSize,
                'original_size' => $originalSize,
                'optimized' => true,
            ];
        }

        unlink($outputPath);

        return [
            'file' => $file,
            'optimized' => false,
            'original_size' => $originalSize,
            'optimized_size' => $originalSize,
        ];
    }
}
