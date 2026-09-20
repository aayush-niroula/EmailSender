<?php

namespace App\Services;

use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DocxOptimizer
{
    public function optimize(UploadedFile $file): array
    {
        $originalSize = $file->getSize();

        $tempDirectory = storage_path('app/temp');

        if (! is_dir($tempDirectory)) {
            mkdir($tempDirectory, 0755, true);
        }

        $inputZip = $file->getRealPath();

        $extractDirectory = $tempDirectory.'/'.uniqid('docx_');
        $outputFile = $tempDirectory.'/'.uniqid('optimized_').'.docx';

        mkdir($extractDirectory, 0755, true);

        $zip = new ZipArchive;

        if ($zip->open($inputZip) !== true) {
            return $this->original($file, $originalSize);
        }

        $zip->extractTo($extractDirectory);
        $zip->close();

        $mediaDirectory = $extractDirectory.'/word/media';

        if (is_dir($mediaDirectory)) {

            $images = glob($mediaDirectory.'/*');

            foreach ($images as $imagePath) {

                $mimeType = mime_content_type($imagePath);

                // Optimize JPEG images only for now
                if ($mimeType === 'image/jpeg') {

                    $this->compressJpeg($imagePath);
                }
            }
        }

        $newZip = new ZipArchive;

        if ($newZip->open($outputFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->deleteDirectory($extractDirectory);

            return $this->original($file, $originalSize);
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                $extractDirectory,
                \RecursiveDirectoryIterator::SKIP_DOTS
            ),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $fileInfo) {

            if (! $fileInfo->isFile()) {
                continue;
            }

            $filePath = $fileInfo->getRealPath();

            $relativePath = substr(
                $filePath,
                strlen($extractDirectory) + 1
            );

            $newZip->addFile(
                $filePath,
                str_replace('\\', '/', $relativePath)
            );
        }

        $newZip->close();

        if (! file_exists($outputFile)) {
            $this->deleteDirectory($extractDirectory);

            return $this->original($file, $originalSize);
        }

        $optimizedSize = filesize($outputFile);

        if ($optimizedSize < $originalSize) {

            $filename = uniqid('optimized_').'.docx';

            $storedPath = Storage::disk('local')->putFileAs(
                'attachments',
                new File($outputFile),
                $filename
            );

            unlink($outputFile);
            $this->deleteDirectory($extractDirectory);

            return [
                'filepath' => $storedPath,
                'file_name' => $filename,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'file_size' => $optimizedSize,
                'original_size' => $originalSize,
                'optimized' => true,
            ];
        }

        unlink($outputFile);
        $this->deleteDirectory($extractDirectory);

        return $this->original($file, $originalSize);
    }

    private function compressJpeg(string $imagePath): void
    {
        if (! function_exists('imagecreatefromjpeg') || ! function_exists('imagejpeg')) {
            return;
        }

        $image = imagecreatefromjpeg($imagePath);

        if (! $image) {
            return;
        }

        imagejpeg(
            $image,
            $imagePath,
            75
        );

        imagedestroy($image);
    }

    private function original(
        UploadedFile $file,
        int $size
    ): array {
        return [
            'file' => $file,
            'optimized' => false,
            'original_size' => $size,
            'optimized_size' => $size,
        ];
    }

    private function deleteDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                $directory,
                \RecursiveDirectoryIterator::SKIP_DOTS
            ),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $file) {

            if ($file->isDir()) {
                rmdir($file->getRealPath());
            } else {
                unlink($file->getRealPath());
            }
        }

        rmdir($directory);
    }
}
