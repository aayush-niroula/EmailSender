<?php

namespace App\Services;

use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageOptimizer
{
    public function optimize(UploadedFile $file): array
    {
        $originalSize = $file->getSize();

        if (! extension_loaded('gd')) {
            return [
                'file' => $file,
                'optimized' => false,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
            ];
        }

        $manager = new ImageManager(
            new Driver
        );

        $mimeType = $file->getMimeType();
        $image = $manager->read(
            $file->getRealPath()
        );

        $image->scaleDown(
            width: 2000,
            height: 2000
        );

        switch ($mimeType) {

            case 'image/jpeg':

                $extension = 'jpg';

                $encodedImage = $image->toJpeg(
                    quality: 75
                );

                break;

            case 'image/png':

                $extension = 'png';

                $encodedImage = $image->toPng();

                break;

            case 'image/webp':

                $extension = 'webp';

                $encodedImage = $image->toWebp(
                    quality: 75
                );

                break;

            case 'image/gif':

                $extension = 'gif';

                $encodedImage = $image->toGif();

                break;

            default:

                // Unsupported image type
                return [
                    'file' => $file,
                    'optimized' => false,
                    'original_size' => $originalSize,
                    'optimized_size' => $originalSize,
                ];
        }

        $filename = uniqid('optimized_').'.'.$extension;

        $tempDirectory = storage_path('app/temp');

        if (! is_dir($tempDirectory)) {
            mkdir($tempDirectory, 0755, true);
        }

        $tempPath = $tempDirectory.DIRECTORY_SEPARATOR.$filename;

        $encodedImage->save($tempPath);

        if (! file_exists($tempPath)) {
            return [
                'file' => $file,
                'optimized' => false,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
            ];
        }

        $optimizedSize = filesize($tempPath);

        if ($optimizedSize < $originalSize) {

            $storedPath = Storage::disk('public')->putFileAs(
                'attachments',
                new File($tempPath),
                $filename
            );

            unlink($tempPath);

            return [
                'filepath' => $storedPath,

                'file_name' => $filename,

                'mime_type' => $mimeType,

                'file_size' => $optimizedSize,

                'original_size' => $originalSize,

                'optimized' => true,
            ];
        }

        unlink($tempPath);

        $originalPath = $file->store(
            'attachments',
            'public'
        );

        return [
            'filepath' => $originalPath,

            'file_name' => $file->getClientOriginalName(),

            'mime_type' => $mimeType,

            'file_size' => $originalSize,

            'original_size' => $originalSize,

            'optimized' => false,
        ];
    }
}
